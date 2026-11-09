/**
 * SENTINEL AI - SSRF Protection Service
 * Protects against Server-Side Request Forgery by blocking localhost, private,
 * link-local, carrier-grade NAT, and cloud metadata endpoints.
 */

import net from 'net';

// Reserved / Private IPv4 CIDR blocks and IP ranges
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.internal',
  'instance-data',
]);

/**
 * Checks if an IPv4 address string falls into a private or restricted range.
 */
export function isPrivateOrRestrictedIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // malformed IP is considered restricted
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 - Current network
  if (a === 0) return true;

  // 10.0.0.0/8 - Private Class A
  if (a === 10) return true;

  // 100.64.0.0/10 - Carrier-grade NAT
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 - Loopback
  if (a === 127) return true;

  // 169.254.0.0/16 - Link-local (Cloud metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 - Private Class B
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 - IETF Protocol Assignments
  if (a === 192 && b === 0 && c === 0) return true;

  // 192.0.2.0/24 - TEST-NET-1 (documentation)
  if (a === 192 && b === 0 && c === 2) return true;

  // 192.168.0.0/16 - Private Class C
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 - Network benchmark tests
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 - TEST-NET-2
  if (a === 198 && b === 51 && c === 100) return true;

  // 203.0.113.0/24 - TEST-NET-3
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 - Multicast
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 - Reserved (Former Class E)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address string is private or restricted.
 */
export function isPrivateOrRestrictedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 loopback or :: unspecified
  if (normalized === '::1' || normalized === '::' || normalized === '0:0:0:0:0:0:0:1') {
    return true;
  }

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  if (normalized.startsWith('::ffff:')) {
    const v4Part = normalized.substring(7);
    if (net.isIPv4(v4Part)) {
      return isPrivateOrRestrictedIPv4(v4Part);
    }
  }

  // Unique local addresses (fc00::/7) -> fc... or fd...
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }

  // Link-local unicast (fe80::/10) -> fe8... to feb...
  if (/^fe[89ab]/i.test(normalized)) {
    return true;
  }

  return false;
}

/**
 * Validates a target host and IP against SSRF policies.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export function validateSsrfTarget(hostname: string, resolvedIps: string[] = []): { allowed: boolean; reason?: string } {
  const cleanHost = hostname.toLowerCase().trim();

  // Check blocked hostname keywords
  if (BLOCKED_HOSTNAMES.has(cleanHost)) {
    return { allowed: false, reason: `Blocked hostname '${cleanHost}' violates SSRF policy.` };
  }

  if (
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.internal') ||
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.onion') ||
    cleanHost.endsWith('.lan')
  ) {
    return { allowed: false, reason: `Private/internal domain suffix in '${cleanHost}' is blocked.` };
  }

  // If host is a raw IP literal
  if (net.isIPv4(cleanHost)) {
    if (isPrivateOrRestrictedIPv4(cleanHost)) {
      return { allowed: false, reason: `IPv4 address ${cleanHost} is in a reserved or private range.` };
    }
  } else if (net.isIPv6(cleanHost)) {
    if (isPrivateOrRestrictedIPv6(cleanHost)) {
      return { allowed: false, reason: `IPv6 address ${cleanHost} is in a reserved or private range.` };
    }
  }

  // Validate all resolved IPs
  for (const ip of resolvedIps) {
    if (net.isIPv4(ip) && isPrivateOrRestrictedIPv4(ip)) {
      return { allowed: false, reason: `Domain resolves to restricted IPv4 address ${ip}.` };
    }
    if (net.isIPv6(ip) && isPrivateOrRestrictedIPv6(ip)) {
      return { allowed: false, reason: `Domain resolves to restricted IPv6 address ${ip}.` };
    }
  }

  return { allowed: true };
}
