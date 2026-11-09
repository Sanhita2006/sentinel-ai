/**
 * SENTINEL AI - Threat Intelligence Feeds Integration
 * Integrates Google Safe Browsing API v4 & abuse.ch URLhaus API.
 * Transparently reports feed status: active findings, clean, or unavailable.
 */

import { ThreatFinding } from './heuristics';

export interface ThreatFeedStatus {
  source: 'Google Safe Browsing' | 'URLhaus Intelligence';
  status: 'clean' | 'flagged' | 'unavailable';
  details: string;
  threatType?: string;
  firstSeen?: string;
  tags?: string[];
}

export interface ThreatFeedResults {
  feeds: ThreatFeedStatus[];
  findings: ThreatFinding[];
}

/**
 * Queries Google Safe Browsing API v4.
 */
export async function queryGoogleSafeBrowsing(url: string): Promise<{ feed: ThreatFeedStatus; finding?: ThreatFinding }> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    return {
      feed: {
        source: 'Google Safe Browsing',
        status: 'unavailable',
        details: 'API key not configured in server environment (GOOGLE_SAFE_BROWSING_API_KEY).',
      },
    };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const requestBody = {
    client: {
      clientId: 'sentinel-ai-cyber-defense',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return {
        feed: {
          source: 'Google Safe Browsing',
          status: 'unavailable',
          details: `Google Safe Browsing returned HTTP status ${res.status}.`,
        },
      };
    }

    const data = await res.json();
    const matches = data.matches || [];

    if (matches.length > 0) {
      const match = matches[0];
      const threatType = match.threatType || 'MALICIOUS_THREAT';

      const finding: ThreatFinding = {
        id: 'GSB-FLAGGED',
        source: 'Google Safe Browsing',
        severity: 'critical',
        title: `Google Safe Browsing Match: ${threatType}`,
        description: `Target URL is confirmed blacklisted by Google Safe Browsing as ${threatType.toLowerCase().replace(/_/g, ' ')}.`,
        evidence: `Threat Type: ${threatType}, Platform: ${match.platformType || 'ANY'}`,
        confidence: 99,
        deductionPoints: 75,
      };

      return {
        feed: {
          source: 'Google Safe Browsing',
          status: 'flagged',
          threatType,
          details: `Flagged as ${threatType} in Google threat list.`,
        },
        finding,
      };
    }

    return {
      feed: {
        source: 'Google Safe Browsing',
        status: 'clean',
        details: 'No threats currently indexed for this URL in Google Safe Browsing.',
      },
      finding: {
        id: 'GSB-CLEAN',
        source: 'Google Safe Browsing',
        severity: 'clean',
        title: 'Google Safe Browsing: Clear',
        description: 'URL is not listed in active Google Safe Browsing threat databases.',
        evidence: '0 matches returned',
        confidence: 90,
        deductionPoints: 0,
      },
    };
  } catch (err: any) {
    return {
      feed: {
        source: 'Google Safe Browsing',
        status: 'unavailable',
        details: `Query failed: ${err.message || 'Network timeout'}`,
      },
    };
  }
}

/**
 * Queries abuse.ch URLhaus API for malware distribution URLs.
 */
export async function queryUrlhaus(url: string, hostname: string): Promise<{ feed: ThreatFeedStatus; finding?: ThreatFinding }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Query URLhaus by URL first
    const params = new URLSearchParams();
    params.append('url', url);

    const res = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SENTINEL-AI-Cybersecurity-Research/1.0',
      },
      body: params.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return {
        feed: {
          source: 'URLhaus Intelligence',
          status: 'unavailable',
          details: `URLhaus API returned HTTP ${res.status}.`,
        },
      };
    }

    const data = await res.json();

    if (data.query_status === 'ok') {
      const threat = data.threat || 'malware_download';
      const reporter = data.reporter || 'Anonymous';
      const tags = data.tags || [];

      const finding: ThreatFinding = {
        id: 'URLHAUS-FLAGGED',
        source: 'URLhaus Intelligence',
        severity: 'critical',
        title: `URLhaus Malicious Payload Host: ${threat}`,
        description: `Target is indexed on abuse.ch URLhaus as an active or recent payload delivery distribution site.`,
        evidence: `Threat: ${threat}, Reporter: ${reporter}, Tags: [${tags.join(', ')}]`,
        confidence: 98,
        deductionPoints: 80,
      };

      return {
        feed: {
          source: 'URLhaus Intelligence',
          status: 'flagged',
          threatType: threat,
          firstSeen: data.date_added,
          tags,
          details: `Confirmed malware distributor (${threat}) indexed on URLhaus.`,
        },
        finding,
      };
    } else if (data.query_status === 'no_results') {
      return {
        feed: {
          source: 'URLhaus Intelligence',
          status: 'clean',
          details: 'No malicious payload records indexed in abuse.ch URLhaus.',
        },
        finding: {
          id: 'URLHAUS-CLEAN',
          source: 'URLhaus Intelligence',
          severity: 'clean',
          title: 'URLhaus Database: Clear',
          description: 'No active malware distribution reports found for this URL in URLhaus.',
          evidence: 'query_status: no_results',
          confidence: 90,
          deductionPoints: 0,
        },
      };
    }

    return {
      feed: {
        source: 'URLhaus Intelligence',
        status: 'clean',
        details: `Query status: ${data.query_status || 'ok'}`,
      },
    };
  } catch (err: any) {
    return {
      feed: {
        source: 'URLhaus Intelligence',
        status: 'unavailable',
        details: `URLhaus connection unreachable: ${err.message || 'Timeout'}`,
      },
    };
  }
}

/**
 * Aggregates all external threat feeds.
 */
export async function queryAllThreatFeeds(url: string, hostname: string): Promise<ThreatFeedResults> {
  const [gsbResult, urlhausResult] = await Promise.all([
    queryGoogleSafeBrowsing(url),
    queryUrlhaus(url, hostname),
  ]);

  const feeds: ThreatFeedStatus[] = [gsbResult.feed, urlhausResult.feed];
  const findings: ThreatFinding[] = [];

  if (gsbResult.finding) findings.push(gsbResult.finding);
  if (urlhausResult.finding) findings.push(urlhausResult.finding);

  return { feeds, findings };
}
