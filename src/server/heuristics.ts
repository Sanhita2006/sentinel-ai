/**
 * SENTINEL AI - Lexical & Heuristic Threat Analyzer
 * Detects IP URLs, URL shorteners, homoglyphs, deep subdomains, and suspicious lexical tokens.
 */

import { ParsedUrlDetails } from './parser';

export interface ThreatFinding {
  id: string;
  source: 'Lexical Heuristics' | 'DNS Engine' | 'Google Safe Browsing' | 'URLhaus Intelligence' | 'Network Safety / SSRF' | 'TLS Validator';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'clean';
  title: string;
  description: string;
  evidence: string;
  confidence: number; // 0 - 100%
  deductionPoints: number; // For transparent scoring
}

// Well-known URL shortening services
const SHORTENER_DOMAINS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'is.gd',
  'cutt.ly',
  'ow.ly',
  'rb.gy',
  'buff.ly',
  'adf.ly',
  'bl.ink',
  'shorturl.at',
  'trib.al',
  'rebrand.ly',
]);

// Well-known high-value brand names often impersonated in phishing
const TARGET_BRANDS = [
  'paypal',
  'chase',
  'wellsfargo',
  'bankofamerica',
  'citibank',
  'apple',
  'microsoft',
  'google',
  'amazon',
  'netflix',
  'facebook',
  'instagram',
  'whatsapp',
  'binance',
  'coinbase',
  'metamask',
  'stripe',
  'dhl',
  'usps',
  'fedex',
  'ups',
];

// High-abuse / high-churn TLDs frequently observed in fast-flux phishing campaigns
const SUSPICIOUS_TLDS = new Set([
  'top',
  'xyz',
  'info',
  'work',
  'click',
  'gq',
  'cf',
  'ml',
  'tk',
  'cam',
  'live',
  'loan',
  'support',
  'country',
  'stream',
  'download',
  'racing',
  'bid',
  'icu',
]);

// Sensitive credential / authentication keywords
const SENSITIVE_KEYWORDS = [
  'login',
  'signin',
  'verify',
  'verification',
  'authenticate',
  'security',
  'secure',
  'update',
  'wallet',
  'recover',
  'recovery',
  'password',
  'account',
  'credential',
  'banking',
  'confirm',
  'billing',
  'validate',
  'mfa',
  'sso',
  'kyc',
];

/**
 * Analyzes the lexical properties of a normalized URL.
 */
export function analyzeUrlHeuristics(parsed: ParsedUrlDetails): ThreatFinding[] {
  const findings: ThreatFinding[] = [];
  const { hostname, domain, subdomain, tld, pathname, search, normalizedUrl, isIpAddress } = parsed;

  // 1. Raw IP Hostname Check
  if (isIpAddress) {
    findings.push({
      id: 'HEUR-RAW-IP',
      source: 'Lexical Heuristics',
      severity: 'high',
      title: 'Host is a Raw IP Address',
      description: 'Legitimate web applications almost universally use registered domain names. Raw IP addresses in URLs are commonly used by attackers to bypass domain-based reputation filters and host short-lived malicious payloads.',
      evidence: `Target host is raw IPv${parsed.ipVersion || 4}: ${hostname}`,
      confidence: 90,
      deductionPoints: 30,
    });
  }

  // 2. URL Shortener Service Detection
  if (SHORTENER_DOMAINS.has(domain)) {
    findings.push({
      id: 'HEUR-SHORTENER',
      source: 'Lexical Heuristics',
      severity: 'medium',
      title: 'URL Shortener Service Detected',
      description: 'Shortened URLs obfuscate the true destination domain, preventing immediate user and firewall inspection before redirection.',
      evidence: `Domain matches known shortening provider '${domain}'`,
      confidence: 85,
      deductionPoints: 20,
    });
  }

  // 3. Punycode & Homoglyph Spoofing Detection
  const isPunycode = hostname.includes('xn--') || domain.includes('xn--');
  // Check for non-ASCII characters in rawInput
  const hasNonAscii = /[^\u0000-\u007F]/.test(parsed.rawInput);

  if (isPunycode || hasNonAscii) {
    findings.push({
      id: 'HEUR-HOMOGLYPH-PUNYCODE',
      source: 'Lexical Heuristics',
      severity: 'critical',
      title: 'Punycode / IDN Homoglyph Spoofing Detected',
      description: 'The domain uses Internationalized Domain Name (IDN) Punycode encoding or non-ASCII Unicode characters that visually mimic legitimate Latin brand names (homoglyphs) to deceive human eyes.',
      evidence: `Domain '${hostname}' contains punycode token (xn--) or non-ASCII Unicode codepoints.`,
      confidence: 98,
      deductionPoints: 50,
    });
  }

  // 4. Subdomain Stacking & Brand Impersonation
  if (subdomain) {
    const subdomainParts = subdomain.split('.');
    if (subdomainParts.length >= 3) {
      findings.push({
        id: 'HEUR-DEEP-SUBDOMAINS',
        source: 'Lexical Heuristics',
        severity: 'medium',
        title: 'Excessive Subdomain Depth Stacking',
        description: `Host contains ${subdomainParts.length} nested subdomain levels. Attackers stack deep subdomains to camouflage deceptive hostnames on mobile devices with truncated address bars.`,
        evidence: `Subdomain tree: '${subdomain}' (${subdomainParts.length} levels)`,
        confidence: 80,
        deductionPoints: 15,
      });
    }

    // Check if a major brand name is embedded inside the subdomain rather than being the authoritative domain
    for (const brand of TARGET_BRANDS) {
      if (subdomain.toLowerCase().includes(brand) && !domain.toLowerCase().includes(brand)) {
        findings.push({
          id: `HEUR-BRAND-SPOOF-${brand.toUpperCase()}`,
          source: 'Lexical Heuristics',
          severity: 'critical',
          title: `Brand Impersonation in Subdomain: ${brand.toUpperCase()}`,
          description: `The trusted brand name '${brand}' is embedded within a subdomain of an unrelated authoritative domain '${domain}'. This is a classic phishing technique to deceive visitors.`,
          evidence: `Brand '${brand}' found in subdomain '${subdomain}' of domain '${domain}'`,
          confidence: 95,
          deductionPoints: 40,
        });
        break; // Only flag the highest brand match
      }
    }
  }

  // 5. Suspicious TLD & Sensitive Keyword Pairing
  const cleanTld = tld.toLowerCase();
  const matchedKeywords = SENSITIVE_KEYWORDS.filter(
    (kw) => hostname.includes(kw) || pathname.toLowerCase().includes(kw)
  );

  if (SUSPICIOUS_TLDS.has(cleanTld) && matchedKeywords.length > 0) {
    findings.push({
      id: 'HEUR-RISK-TLD-SENSITIVE',
      source: 'Lexical Heuristics',
      severity: 'high',
      title: 'High-Risk TLD Paired with Authentication Keywords',
      description: `Domain uses top-level domain '.${cleanTld}' frequently observed in automated phishing kits, combined with sensitive security keywords (${matchedKeywords.slice(0, 3).join(', ')}).`,
      evidence: `TLD: '.${cleanTld}', Keywords: [${matchedKeywords.join(', ')}]`,
      confidence: 88,
      deductionPoints: 25,
    });
  } else if (matchedKeywords.length >= 3) {
    findings.push({
      id: 'HEUR-KEYWORD-STUFFING',
      source: 'Lexical Heuristics',
      severity: 'medium',
      title: 'Multiple Security Keyword Tokens in URL',
      description: 'The URL contains multiple stacked authentication and verification tokens, which is characteristic of credential harvesting kits.',
      evidence: `Matched tokens: [${matchedKeywords.join(', ')}]`,
      confidence: 75,
      deductionPoints: 15,
    });
  }

  // 6. Excessive URL Length & Complexity
  if (normalizedUrl.length > 100) {
    findings.push({
      id: 'HEUR-LONG-URL',
      source: 'Lexical Heuristics',
      severity: 'low',
      title: 'Abnormal URL Length',
      description: `URL length is ${normalizedUrl.length} characters (typical benign web links are under 75 characters). Extreme length can indicate payload embedding or address bar truncation tricks.`,
      evidence: `Total character length: ${normalizedUrl.length}`,
      confidence: 70,
      deductionPoints: 10,
    });
  }

  // 7. At-Sign (@) In Authority or URL Path
  if (parsed.rawInput.includes('@')) {
    findings.push({
      id: 'HEUR-AT-SIGN-OBFUSCATION',
      source: 'Lexical Heuristics',
      severity: 'high',
      title: 'At-Sign (@) URL Authority Obfuscation',
      description: 'The URL uses the "@" character. In standard URL parsing, everything before "@" is treated as user authentication data, masking the true host destination that follows.',
      evidence: `At-sign found in user input '${parsed.rawInput}'`,
      confidence: 95,
      deductionPoints: 30,
    });
  }

  // If no negative findings, add a clean baseline indicator
  if (findings.length === 0) {
    findings.push({
      id: 'HEUR-CLEAN-BASELINE',
      source: 'Lexical Heuristics',
      severity: 'clean',
      title: 'Nominal Lexical Structure',
      description: 'No homoglyph characters, raw IP hosts, URL shorteners, or aggressive credential harvesting patterns were detected in the URL structure.',
      evidence: `Evaluated FQDN: ${hostname}`,
      confidence: 92,
      deductionPoints: 0,
    });
  }

  return findings;
}
