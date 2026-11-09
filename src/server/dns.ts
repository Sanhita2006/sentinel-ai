/**
 * SENTINEL AI - Safe DNS Resolution Service
 * Queries authoritative DNS records (A, AAAA, MX, TXT, NS) with strict timeouts
 * and validates resolved IPs against SSRF restrictions.
 */

import dns from 'dns';
import { ThreatFinding } from './heuristics';
import { validateSsrfTarget } from './ssrf';

const dnsPromises = dns.promises;

export interface DnsAuditResult {
  resolves: boolean;
  aRecords: string[];
  aaaaRecords: string[];
  mxRecords: Array<{ exchange: string; priority: number }>;
  txtRecords: string[];
  nsRecords: string[];
  spfConfigured: boolean;
  error?: string;
  findings: ThreatFinding[];
}

/**
 * Timeout helper for DNS queries.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('DNS query timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Resolves all DNS record types for a domain safely.
 */
export async function performSafeDnsAudit(hostname: string): Promise<DnsAuditResult> {
  const findings: ThreatFinding[] = [];
  const result: DnsAuditResult = {
    resolves: false,
    aRecords: [],
    aaaaRecords: [],
    mxRecords: [],
    txtRecords: [],
    nsRecords: [],
    spfConfigured: false,
    findings: [],
  };

  // If host is raw IP, no DNS lookup needed
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
    result.resolves = true;
    result.aRecords = [hostname];
    return result;
  }

  // Pre-SSRF check on hostname
  const preCheck = validateSsrfTarget(hostname);
  if (!preCheck.allowed) {
    findings.push({
      id: 'DNS-SSRF-BLOCKED',
      source: 'Network Safety / SSRF',
      severity: 'critical',
      title: 'Target Blocked by SSRF Policy',
      description: preCheck.reason || 'Target domain resolves to a forbidden internal address.',
      evidence: `Hostname: ${hostname}`,
      confidence: 100,
      deductionPoints: 50,
    });
    result.findings = findings;
    return result;
  }

  // 1. Resolve A records (IPv4)
  try {
    const ips = await withTimeout(dnsPromises.resolve4(hostname), 2000);
    result.aRecords = ips;
    result.resolves = ips.length > 0;

    // Check all resolved IPs against SSRF
    const ssrfCheck = validateSsrfTarget(hostname, ips);
    if (!ssrfCheck.allowed) {
      findings.push({
        id: 'DNS-SSRF-RESOLVED-IP',
        source: 'Network Safety / SSRF',
        severity: 'critical',
        title: 'Resolved IP in Restricted Address Space',
        description: ssrfCheck.reason || 'The domain resolves to private or loopback IP ranges.',
        evidence: `Resolved IPs: [${ips.join(', ')}]`,
        confidence: 100,
        deductionPoints: 70,
      });
    }
  } catch (err: any) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      findings.push({
        id: 'DNS-NXDOMAIN',
        source: 'DNS Engine',
        severity: 'high',
        title: 'Domain Fails to Resolve (NXDOMAIN)',
        description: 'The target domain does not resolve to an active IPv4 address. It may be inactive, abandoned, or seized/sinkholed.',
        evidence: `DNS Error: ${err.code}`,
        confidence: 90,
        deductionPoints: 30,
      });
      result.error = 'Domain does not resolve (NXDOMAIN)';
      result.findings = findings;
      return result;
    } else {
      result.error = err.message || 'DNS A record resolution failed';
    }
  }

  // 2-5: If domain resolves, query AAAA, MX, TXT, NS concurrently
  if (result.resolves) {
    const [aaaaResult, mxResult, txtResult, nsResult] = await Promise.allSettled([
      withTimeout(dnsPromises.resolve6(hostname), 2000),
      withTimeout(dnsPromises.resolveMx(hostname), 2000),
      withTimeout(dnsPromises.resolveTxt(hostname), 2000),
      withTimeout(dnsPromises.resolveNs(hostname), 2000),
    ]);

    if (aaaaResult.status === 'fulfilled') {
      result.aaaaRecords = aaaaResult.value;
    }

    if (mxResult.status === 'fulfilled') {
      result.mxRecords = mxResult.value;
    }

    if (txtResult.status === 'fulfilled') {
      const flatTxt = txtResult.value.map((chunk) => chunk.join(' '));
      result.txtRecords = flatTxt;

      const spfRecord = flatTxt.find((t) => t.toLowerCase().startsWith('v=spf1'));
      if (spfRecord) {
        result.spfConfigured = true;
        if (spfRecord.includes('+all') || spfRecord.includes('?all')) {
          findings.push({
            id: 'DNS-PERMISSIVE-SPF',
            source: 'DNS Engine',
            severity: 'medium',
            title: 'Permissive SPF Policy (+all / ?all)',
            description: 'The SPF record allows any host to send emails on behalf of this domain, facilitating email spoofing.',
            evidence: spfRecord,
            confidence: 85,
            deductionPoints: 15,
          });
        }
      } else if (result.mxRecords.length > 0) {
        findings.push({
          id: 'DNS-MISSING-SPF',
          source: 'DNS Engine',
          severity: 'low',
          title: 'Missing SPF Email Authentication',
          description: 'Domain has MX mail servers configured but lacks an SPF TXT record, leaving inbound and outbound mail open to spoofing.',
          evidence: 'No v=spf1 TXT record found',
          confidence: 80,
          deductionPoints: 10,
        });
      }
    }

    if (nsResult.status === 'fulfilled') {
      result.nsRecords = nsResult.value;
    }
  }

  // Check baseline resolution safety
  if (result.resolves && findings.length === 0) {
    findings.push({
      id: 'DNS-ACTIVE-RESOLVED',
      source: 'DNS Engine',
      severity: 'clean',
      title: 'Active DNS Resolution',
      description: `Domain successfully resolves to ${result.aRecords.length} IPv4 addresses with legitimate nameserver delegation.`,
      evidence: `A: [${result.aRecords.slice(0, 3).join(', ')}]`,
      confidence: 90,
      deductionPoints: 0,
    });
  }

  result.findings = findings;
  return result;
}
