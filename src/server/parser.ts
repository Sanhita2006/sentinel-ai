/**
 * SENTINEL AI - URL Parsing & Normalization Service
 * Sanitizes input, rejects malformed schemas, and extracts domain components.
 */

import net from 'net';

export interface ParsedUrlDetails {
  rawInput: string;
  normalizedUrl: string;
  protocol: 'http:' | 'https:';
  hostname: string;
  domain: string;
  subdomain: string;
  tld: string;
  port: string;
  pathname: string;
  search: string;
  isIpAddress: boolean;
  ipVersion: 4 | 6 | null;
}

/**
 * Validates domain label syntax (RFC 1035 / RFC 1123).
 */
function isValidDomain(hostname: string): boolean {
  if (hostname.length > 253) return false;

  const labels = hostname.split('.');
  if (labels.length < 2) return false;

  for (const label of labels) {
    if (label.length === 0 || label.length > 63) return false;
    // Allow punycode labels starting with xn--
    if (!/^[a-zA-Z0-9_-]+$/.test(label)) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
  }

  // TLD check (last label must be at least 2 chars or punycode)
  const tld = labels[labels.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld) && !tld.startsWith('xn--')) {
    return false;
  }

  return true;
}

/**
 * Parses and normalizes any user-submitted URL or domain string.
 * Throws an Error with a user-friendly message on invalid or dangerous input.
 */
export function parseAndNormalizeUrl(input: string): ParsedUrlDetails {
  if (!input || typeof input !== 'string') {
    throw new Error('Target URL or domain cannot be empty.');
  }

  const trimmed = input.trim();
  if (trimmed.length > 2048) {
    throw new Error('Target input exceeds maximum permissible URL length (2048 characters).');
  }

  // Reject explicit dangerous protocols
  const lowerInput = trimmed.toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'file:', 'vbscript:', 'about:', 'blob:'];
  for (const proto of dangerousProtocols) {
    if (lowerInput.startsWith(proto)) {
      throw new Error(`Rejected unsafe protocol scheme '${proto}'. Only http:// and https:// are permitted.`);
    }
  }

  // Auto-prepend https:// if no scheme is specified
  let urlString = trimmed;
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch (err: any) {
    throw new Error(`Malformed URL input: unable to parse standard URL structure (${err.message || 'Syntax error'}).`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol '${parsed.protocol}'. Only http: and https: web investigations are supported.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    throw new Error('Invalid URL: missing target hostname or domain.');
  }

  // Check if hostname is a raw IP
  let isIpAddress = false;
  let ipVersion: 4 | 6 | null = null;

  if (net.isIPv4(hostname)) {
    isIpAddress = true;
    ipVersion = 4;
  } else if (net.isIPv6(hostname.replace(/^\[|\]$/g, ''))) {
    isIpAddress = true;
    ipVersion = 6;
  } else {
    // Validate domain format
    if (!isValidDomain(hostname)) {
      throw new Error(`Invalid domain name format '${hostname}'. Ensure proper FQDN syntax (e.g. example.com).`);
    }
  }

  // Extract TLD, domain and subdomains
  let tld = '';
  let domain = hostname;
  let subdomain = '';

  if (!isIpAddress) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      tld = parts[parts.length - 1];
      // Basic 2-level SLD handling (e.g. .co.uk, .com.au, .gov.in)
      const commonSecondLevel = new Set(['co', 'com', 'org', 'net', 'edu', 'gov', 'mil']);
      if (parts.length >= 3 && commonSecondLevel.has(parts[parts.length - 2]) && tld.length === 2) {
        tld = `${parts[parts.length - 2]}.${tld}`;
        domain = parts.slice(-3).join('.');
        subdomain = parts.slice(0, -3).join('.');
      } else {
        domain = parts.slice(-2).join('.');
        subdomain = parts.slice(0, -2).join('.');
      }
    }
  }

  return {
    rawInput: input,
    normalizedUrl: parsed.toString(),
    protocol: parsed.protocol as 'http:' | 'https:',
    hostname,
    domain,
    subdomain,
    tld,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    isIpAddress,
    ipVersion,
  };
}
