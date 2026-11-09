/**
 * SENTINEL AI - Core Type Definitions
 * Cybersecurity Operations & Threat Intelligence Data Models
 */

export type PageId =
  | 'dashboard'
  | 'website-investigation'
  | 'phishing-detection'
  | 'tls-certificate'
  | 'scam-analysis'
  | 'security-assessment'
  | 'threat-intelligence'
  | 'blockchain-verification'
  | 'history'
  | 'reports'
  | 'ai-assistant'
  | 'settings';

export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'clean';

export type InvestigationStatus = 'completed' | 'analyzing' | 'flagged' | 'queued';

export interface ThreatMetric {
  title: string;
  value: string;
  numericValue: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  severity?: ThreatLevel;
}

export interface InvestigationRecord {
  id: string;
  target: string;
  targetType: 'domain' | 'url' | 'ip' | 'email';
  verdict: 'Malicious' | 'Suspicious' | 'Clean' | 'Inconclusive';
  severity: ThreatLevel;
  trustScore: number; // 0 - 100 (100 = safest)
  categories: string[];
  timestamp: string;
  investigator: string;
  ipAddress: string;
  country: string;
  countryCode: string;
  asn: string;
  tlsStatus: 'Valid' | 'Expired' | 'Untrusted' | 'Self-Signed' | 'None';
  hashProof: string;
}

export interface DnsRecord {
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA';
  name: string;
  value: string;
  ttl: number;
}

export interface SecurityHeaderItem {
  name: string;
  status: 'present' | 'missing' | 'misconfigured';
  value?: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface TlsCertificateDetails {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  signatureAlgorithm: string;
  cipherSuite: string;
  protocolVersion: string;
  sanList: string[];
  serialNumber: string;
  fingerprintSha256: string;
  ctLogVerified: boolean;
  ocspStapling: boolean;
  revocationStatus: 'Good' | 'Revoked' | 'Unknown';
}

export interface PhishingVectorAnalysis {
  targetDomain: string;
  punycodeDetected: boolean;
  decodedPunycode?: string;
  homoglyphChars: string[];
  brandImpersonated?: string;
  entropyScore: number; // 0.0 - 5.0
  subdomainDepth: number;
  tldRiskCategory: 'High' | 'Medium' | 'Low';
  credentialFormDetected: boolean;
  dnsAgeDays: number;
  matchedBlacklists: string[];
}

export interface ScamMessageAnalysisResult {
  sourceType: 'email' | 'sms' | 'chat';
  urgencyLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  manipulationTactics: string[];
  impersonatedEntity: string;
  extractedLinks: Array<{
    url: string;
    resolvedDestination: string;
    isShortened: boolean;
    verdict: 'Malicious' | 'Suspicious' | 'Clean';
  }>;
  headerAuth?: {
    spf: 'Pass' | 'Fail' | 'SoftFail' | 'Neutral' | 'None';
    dkim: 'Pass' | 'Fail' | 'None';
    dmarc: 'Pass' | 'Fail' | 'None';
  };
  confidenceScore: number; // 0 - 100%
  analystSummary: string;
}

export interface BlockchainAuditBlock {
  blockNumber: number;
  timestamp: string;
  threatTarget: string;
  verdictHash: string;
  previousBlockHash: string;
  consensusValidator: string;
  digitalSignature: string;
  merkleRoot: string;
  status: 'Confirmed' | 'Validating';
}

export interface ThreatIntelligenceFeedItem {
  id: string;
  type: 'Domain' | 'IP' | 'Hash' | 'C2' | 'Phishing Campaign';
  indicator: string;
  threatActor?: string;
  confidence: number;
  firstSeen: string;
  lastActive: string;
  mitreTactics: string[];
  tags: string[];
  status: 'Active' | 'Dormant' | 'Sinkholed';
}
