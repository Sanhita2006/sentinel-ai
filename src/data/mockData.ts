/**
 * SENTINEL AI - Curated Threat Intelligence & Simulation Data
 * NOTICE: All records below are simulated DEMO DATA for Hackathon prototype demonstration.
 * They represent realistic threat indicators, phishing vectors, and TLS anomalies.
 */

import {
  InvestigationRecord,
  DnsRecord,
  SecurityHeaderItem,
  TlsCertificateDetails,
  PhishingVectorAnalysis,
  ScamMessageAnalysisResult,
  BlockchainAuditBlock,
  ThreatIntelligenceFeedItem,
} from '../types';

export const DEMO_DATA_DISCLAIMER =
  'PROTOTYPE DEMONSTRATION DATA: Security scores, threat indicators, and certificate telemetry shown in this interface are generated demo samples for evaluation purposes. No automated active cyber-scanning is performed on third-party live targets.';

export const SAMPLE_INVESTIGATIONS: InvestigationRecord[] = [
  {
    id: 'INV-2026-9041',
    target: 'secure-login-chase-update.info',
    targetType: 'domain',
    verdict: 'Malicious',
    severity: 'critical',
    trustScore: 8,
    categories: ['Credential Harvesting', 'Banking Impersonation', 'Fast-Flux DNS'],
    timestamp: '2026-11-07 17:42:19 UTC',
    investigator: 'Analyst SOC-04',
    ipAddress: '194.26.29.114',
    country: 'Seychelles',
    countryCode: 'SC',
    asn: 'AS208657 - Fenix Host LTD',
    tlsStatus: 'Self-Signed',
    hashProof: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'INV-2026-9040',
    target: 'pаypаl.com (xn--pyp-6cd.com)',
    targetType: 'domain',
    verdict: 'Malicious',
    severity: 'critical',
    trustScore: 12,
    categories: ['Cyrillic Homoglyph Attack', 'Payment Scam', 'Punycode Spoofing'],
    timestamp: '2026-11-07 17:31:05 UTC',
    investigator: 'Automated Heuristic Engine',
    ipAddress: '45.154.255.82',
    country: 'Panama',
    countryCode: 'PA',
    asn: 'AS57523 - Virtual Server B.V.',
    tlsStatus: 'Untrusted',
    hashProof: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  {
    id: 'INV-2026-9039',
    target: 'appleid-support-auth-session.top',
    targetType: 'domain',
    verdict: 'Malicious',
    severity: 'high',
    trustScore: 19,
    categories: ['Cloudflare Abuse', 'Brand Phishing', 'Dynamic DNS'],
    timestamp: '2026-11-07 17:15:22 UTC',
    investigator: 'Analyst SOC-02',
    ipAddress: '104.21.34.18',
    country: 'United States',
    countryCode: 'US',
    asn: 'AS13335 - Cloudflare, Inc.',
    tlsStatus: 'Valid',
    hashProof: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
  },
  {
    id: 'INV-2026-9038',
    target: 'global-logistics-portal.net',
    targetType: 'domain',
    verdict: 'Suspicious',
    severity: 'medium',
    trustScore: 54,
    categories: ['Newly Registered Domain (3 days)', 'Missing DMARC', 'Open Port 8080'],
    timestamp: '2026-11-07 16:58:40 UTC',
    investigator: 'Analyst SOC-07',
    ipAddress: '185.191.171.43',
    country: 'Bulgaria',
    countryCode: 'BG',
    asn: 'AS44547 - Host Africa LTD',
    tlsStatus: 'Valid',
    hashProof: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
  },
  {
    id: 'INV-2026-9037',
    target: 'stripe.com',
    targetType: 'domain',
    verdict: 'Clean',
    severity: 'clean',
    trustScore: 98,
    categories: ['HSTS Preloaded', 'EV Certificate', 'PFS Enabled', 'Strict CSP'],
    timestamp: '2026-11-07 16:40:11 UTC',
    investigator: 'Automated Baseline Audit',
    ipAddress: '54.187.159.182',
    country: 'United States',
    countryCode: 'US',
    asn: 'AS16509 - Amazon.com, Inc.',
    tlsStatus: 'Valid',
    hashProof: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
  },
  {
    id: 'INV-2026-9036',
    target: 'dhl-tracking-package-notification.xyz',
    targetType: 'domain',
    verdict: 'Malicious',
    severity: 'high',
    trustScore: 16,
    categories: ['Smishing Landing Page', 'Postal Scam', 'Obfuscated JavaScript'],
    timestamp: '2026-11-07 16:12:00 UTC',
    investigator: 'Analyst SOC-01',
    ipAddress: '193.106.191.12',
    country: 'Russia',
    countryCode: 'RU',
    asn: 'AS48282 - NetSource Global',
    tlsStatus: 'Valid',
    hashProof: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
  },
  {
    id: 'INV-2026-9035',
    target: 'github.com',
    targetType: 'domain',
    verdict: 'Clean',
    severity: 'clean',
    trustScore: 99,
    categories: ['Enterprise Infrastructure', 'DNSSEC Verified', 'CT Verified'],
    timestamp: '2026-11-07 15:45:29 UTC',
    investigator: 'Automated Baseline Audit',
    ipAddress: '140.82.121.4',
    country: 'United States',
    countryCode: 'US',
    asn: 'AS36459 - GitHub, Inc.',
    tlsStatus: 'Valid',
    hashProof: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
  },
];

export const DEMO_PRESET_TARGETS = [
  { label: 'Chase Phish (Malicious)', value: 'secure-login-chase-update.info' },
  { label: 'PayPal Homoglyph (Spoof)', value: 'pаypаl.com' },
  { label: 'Apple ID Harvesting', value: 'appleid-support-auth-session.top' },
  { label: 'Stripe (Clean Target)', value: 'stripe.com' },
  { label: 'DHL Delivery Scam', value: 'dhl-tracking-package-notification.xyz' },
  { label: 'Newly Created Domain', value: 'global-logistics-portal.net' },
];

export const SAMPLE_DNS_RECORDS: DnsRecord[] = [
  { type: 'A', name: '@', value: '194.26.29.114', ttl: 300 },
  { type: 'AAAA', name: '@', value: '2a02:4780:8:1191::1', ttl: 300 },
  { type: 'NS', name: '@', value: 'ns1.bulletproof-dns.is', ttl: 86400 },
  { type: 'NS', name: '@', value: 'ns2.bulletproof-dns.is', ttl: 86400 },
  { type: 'MX', name: '@', value: '10 mail.disposable-relay.to', ttl: 3600 },
  { type: 'TXT', name: '@', value: 'v=spf1 ?all (Permissive Relay)', ttl: 300 },
];

export const SAMPLE_SECURITY_HEADERS: SecurityHeaderItem[] = [
  {
    name: 'Content-Security-Policy',
    status: 'missing',
    recommendation: 'Enforce default-src self to prevent cross-site script injection and malicious external embeds.',
    severity: 'high',
  },
  {
    name: 'Strict-Transport-Security (HSTS)',
    status: 'missing',
    recommendation: 'Configure max-age=31536000; includeSubDomains; preload to protect against SSL stripping attacks.',
    severity: 'high',
  },
  {
    name: 'X-Frame-Options',
    status: 'missing',
    recommendation: 'Set to DENY or SAMEORIGIN to prevent clickjacking in iframe embeds.',
    severity: 'medium',
  },
  {
    name: 'X-Content-Type-Options',
    status: 'present',
    value: 'nosniff',
    recommendation: 'Correctly configured to prevent MIME type sniffing.',
    severity: 'low',
  },
  {
    name: 'Referrer-Policy',
    status: 'misconfigured',
    value: 'unsafe-url',
    recommendation: 'Change from unsafe-url to strict-origin-when-cross-origin to avoid leaking full query path credentials.',
    severity: 'medium',
  },
  {
    name: 'Permissions-Policy',
    status: 'missing',
    recommendation: 'Restrict access to hardware features like camera, microphone, and geolocation.',
    severity: 'low',
  },
];

export const SAMPLE_TLS_CERTIFICATE: TlsCertificateDetails = {
  subject: 'CN=secure-login-chase-update.info, O=Temporary Registration LLC',
  issuer: 'CN=ZeroSSL ECC Domain Secure Site CA, O=ZeroSSL, C=AT',
  validFrom: '2026-11-04 12:00:00 UTC',
  validTo: '2027-02-02 12:00:00 UTC',
  daysRemaining: 87,
  signatureAlgorithm: 'SHA256withRSA',
  cipherSuite: 'TLS_AES_128_GCM_SHA256 (Weak forward secrecy posture on legacy fallback)',
  protocolVersion: 'TLS 1.3 / TLS 1.2',
  sanList: [
    'secure-login-chase-update.info',
    'www.secure-login-chase-update.info',
    'chase-auth-portal.info',
    'mobile-chase-verify.info',
  ],
  serialNumber: '4A:89:C2:11:00:3B:EE:74:9A:12',
  fingerprintSha256: '9A:B3:7F:1C:82:5D:EE:11:43:09:88:AC:B1:00:1E:56:88:49:12:7A:CD:01:22:98:FF:3E:12:44:91:0A:77:88',
  ctLogVerified: true,
  ocspStapling: false,
  revocationStatus: 'Good',
};

export const SAMPLE_PHISHING_VECTORS: PhishingVectorAnalysis = {
  targetDomain: 'pаypаl.com',
  punycodeDetected: true,
  decodedPunycode: 'xn--pyp-6cd.com',
  homoglyphChars: ['а (U+0430 Cyrillic Small Letter A replaces Latin "a")'],
  brandImpersonated: 'PayPal Inc. (Brand Confidence: 99.4%)',
  entropyScore: 3.84,
  subdomainDepth: 3,
  tldRiskCategory: 'High',
  credentialFormDetected: true,
  dnsAgeDays: 2,
  matchedBlacklists: [
    'Google Safe Browsing (Flagged)',
    'PhishTank (Verified Incident #819201)',
    'URLhaus (Active Payload Host)',
    'Spamhaus ZEN (Flagged ASN)',
  ],
};

export const SAMPLE_SCAM_MESSAGES = [
  {
    id: 'scam-email-1',
    title: 'Urgent Chase Wire Freeze Notice',
    snippet: 'Immediate Action Required: Your primary account has been placed on temporary hold due to unauthorized logins...',
    sourceType: 'email' as const,
    rawText: `Return-Path: <security-alert@chase-secure-update-notice.com>
Authentication-Results: spf=fail (sender IP is 194.26.29.114) smtp.mailfrom=chase-secure-update-notice.com; dkim=none; dmarc=fail action=none
From: "Chase Account Security" <security@chase-secure-update-notice.com>
To: target-victim@company.com
Subject: [URGENT] Security Alert: Unusual login from IP 185.12.99.1 (Moscow, RU)

Dear Customer,

We noticed an unauthorized login attempt to your Chase Online banking from Moscow, Russia at 03:14 AM. 

Your account access has been restricted to prevent loss of funds. You must verify your credentials and confirm your Social Security Number within 2 hours, otherwise your debit card will be permanently canceled and assets frozen.

Click here to immediately verify your identity:
https://chase-security-verify.help-desk-update.xyz/login?session=9284102

Thank you,
Chase Fraud Prevention Center`,
  },
  {
    id: 'scam-sms-1',
    title: 'USPS / DHL Parcel Unpaid Customs Fee',
    snippet: 'USPS Notice: Your parcel #US984102 cannot be dispatched due to an incomplete delivery address and $1.85 unpaid customs tax...',
    sourceType: 'sms' as const,
    rawText: `[USPS Alert] Your shipment (pkg #9302194812) has arrived at the local distribution facility but cannot be delivered due to missing apartment number and $1.85 processing fee. Please confirm your address and settle fee within 12 hours to avoid package return: https://usps-post-redelivery.top/fee?id=82910`,
  },
  {
    id: 'scam-chat-1',
    title: 'CEO Urgent Gift Card Request (Telegram/Slack)',
    snippet: 'Hey, are you free right now? I need you to purchase 5 Apple Gift Cards for our client meeting right now...',
    sourceType: 'chat' as const,
    rawText: `Executive Management (via WhatsApp Web):
Hey, are you at your desk? I'm trapped in an emergency investor board conference and cannot make voice calls. 
I need an urgent favor for a strategic partner gift. Can you purchase 5x $200 Apple Gift Cards from the nearest store or online portal and send me photos of the back codes right here? 
Will expense and reimburse you on Monday morning with priority. Treat this as strictly confidential.`,
  },
];

export const SAMPLE_BLOCKCHAIN_BLOCKS: BlockchainAuditBlock[] = [
  {
    blockNumber: 104829,
    timestamp: '2026-11-07 17:42:25 UTC',
    threatTarget: 'secure-login-chase-update.info',
    verdictHash: '0x8f2a994cbe41982b6b5539201948ab1164919cb42e99f0101488c991a0b38421',
    previousBlockHash: '0x19a002ebbc64811a00fc24a9101039db49182aa410b00c9201019a8204910284',
    consensusValidator: 'Sentinel-Node-Frankfurt-01',
    digitalSignature: 'SIG_ED25519_810928_VERIFIED',
    merkleRoot: '0x44ab9102948c00192a481944810283c4',
    status: 'Confirmed',
  },
  {
    blockNumber: 104828,
    timestamp: '2026-11-07 17:31:12 UTC',
    threatTarget: 'xn--pyp-6cd.com (pаypаl.com)',
    verdictHash: '0x4c098192a014902b9e8471629501847183910582049182aa4819028419201948',
    previousBlockHash: '0x33b9104819204958172635481902847182910485719204918273648192049182',
    consensusValidator: 'Sentinel-Node-Singapore-03',
    digitalSignature: 'SIG_ED25519_994812_VERIFIED',
    merkleRoot: '0x12fc3391048192a48190284819048190',
    status: 'Confirmed',
  },
  {
    blockNumber: 104827,
    timestamp: '2026-11-07 17:15:30 UTC',
    threatTarget: 'appleid-support-auth-session.top',
    verdictHash: '0x7b19401928471625384910284719284716253849102847192847162538491028',
    previousBlockHash: '0x9910284716253849102847192847162538491028471928471625384910284719',
    consensusValidator: 'Sentinel-Node-Virginia-02',
    digitalSignature: 'SIG_ED25519_384910_VERIFIED',
    merkleRoot: '0x99a01928471625384910284719284716',
    status: 'Confirmed',
  },
  {
    blockNumber: 104826,
    timestamp: '2026-11-07 16:58:48 UTC',
    threatTarget: 'global-logistics-portal.net',
    verdictHash: '0x6648192048192048192048192048192048192048192048192048192048192048',
    previousBlockHash: '0x5519284719284719284719284719284719284719284719284719284719284719',
    consensusValidator: 'Sentinel-Node-Tokyo-01',
    digitalSignature: 'SIG_ED25519_192847_VERIFIED',
    merkleRoot: '0x77284719284719284719284719284719',
    status: 'Confirmed',
  },
];

export const SAMPLE_THREAT_FEED: ThreatIntelligenceFeedItem[] = [
  {
    id: 'IOC-88219',
    type: 'Domain',
    indicator: 'chase-security-verify.help-desk-update.xyz',
    threatActor: 'TA505 (Clop Affiliate)',
    confidence: 96,
    firstSeen: '2026-11-07 14:02 UTC',
    lastActive: '6 mins ago',
    mitreTactics: ['T1566.002 - Spearphishing Link', 'T1584 - Compromise Infrastructure'],
    tags: ['Banking Phishing', 'Fast Flux', 'Active Campaign'],
    status: 'Active',
  },
  {
    id: 'IOC-88218',
    type: 'IP',
    indicator: '194.26.29.114',
    threatActor: 'Unknown Bulletproof Proxy',
    confidence: 99,
    firstSeen: '2026-11-06 09:20 UTC',
    lastActive: '12 mins ago',
    mitreTactics: ['T1090.003 - Multi-hop Proxy', 'T1071.001 - Web Protocols'],
    tags: ['C2 Node', 'Scam Relay', 'Bulletproof Host'],
    status: 'Active',
  },
  {
    id: 'IOC-88217',
    type: 'Phishing Campaign',
    indicator: 'Operation SilverHydra (Global Banking Credential Harvester)',
    threatActor: 'RedDelta Threat Group',
    confidence: 92,
    firstSeen: '2026-11-01 00:00 UTC',
    lastActive: '23 mins ago',
    mitreTactics: ['T1566 - Phishing', 'T1556 - Modify Authentication Process'],
    tags: ['Punycode', 'ZeroSSL Abuse', 'MFA Bypass Proxy'],
    status: 'Active',
  },
  {
    id: 'IOC-88216',
    type: 'Hash',
    indicator: '8f43a9b9104819e0928371649201948271635482910293847162534819203948',
    threatActor: 'Lazarus Sub-Cluster',
    confidence: 88,
    firstSeen: '2026-11-05 18:30 UTC',
    lastActive: '3 hours ago',
    mitreTactics: ['T1059.001 - PowerShell', 'T1027 - Obfuscated Files'],
    tags: ['Phishing Dropper', 'Stealer DLL'],
    status: 'Dormant',
  },
  {
    id: 'IOC-88215',
    type: 'Domain',
    indicator: 'usps-post-redelivery.top',
    threatActor: 'Postal Smishing Syndicate',
    confidence: 94,
    firstSeen: '2026-11-07 08:14 UTC',
    lastActive: '45 mins ago',
    mitreTactics: ['T1566.003 - Spearphishing SMS', 'T1583.001 - Domains'],
    tags: ['Smishing', 'Credit Card Stealer'],
    status: 'Active',
  },
];
