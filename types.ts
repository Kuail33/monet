
export enum Verdict {
  VERIFIED = 'VERIFIED',
  ALTERED = 'ALTERED',
  MISSING = 'MISSING',
  INVALID = 'INVALID'
}

export interface MonetPayload {
  v: number;
  wid: string;
  uid: string;
  ts: number;
  sha: string;
  sig?: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video';
  createdAt: number;
  watermarkId: string;
  url: string;
  originalSha: string;
}

export interface VerificationHistoryItem extends VerificationResult {
  id: string;
  fileName: string;
  timestamp: number;
}

export interface VerificationResult {
  verdict: Verdict;
  confidence: number;
  watermarkId?: string;
  explanation: string;
  signatureScore: number;
  integrityScore: number;
  evidence: {
    sigValid: boolean;
    hashMatch: boolean;
  };
}

export interface AppState {
  user: {
    uid: string;
    displayName: string;
  } | null;
  assets: AssetRecord[];
}
