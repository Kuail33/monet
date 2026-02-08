
import { MonetPayload, Verdict, VerificationResult } from '../types';

/**
 * SIMULATED WATERMARK SERVICE
 * In a real app, this happens on a secure FastAPI backend.
 */

const PAYLOAD_BEGIN_STR = "MONET_PAYLOAD_BEGIN:";
const PAYLOAD_END_STR = ":MONET_PAYLOAD_END";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PAYLOAD_BEGIN_BYTES = encoder.encode(PAYLOAD_BEGIN_STR);
const PAYLOAD_END_BYTES = encoder.encode(PAYLOAD_END_STR);

// Helper to get hash of a specific part of a buffer
const generateHashFromBuffer = async (buffer: ArrayBuffer): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateSignature = (payload: MonetPayload): string => {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

/**
 * Finds the index of a sub-array within a Uint8Array, searching from the end.
 */
function lastIndexOfBytes(data: Uint8Array, search: Uint8Array): number {
  if (search.length === 0) return -1;
  for (let i = data.length - search.length; i >= 0; i--) {
    let match = true;
    for (let j = 0; j < search.length; j++) {
      if (data[i + j] !== search[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}

export const embedWatermark = async (file: File, userId: string): Promise<{ watermarkedBlob: Blob, payload: MonetPayload }> => {
  const originalBuffer = await file.arrayBuffer();
  const sha = await generateHashFromBuffer(originalBuffer);
  
  const wid = `WMK_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const payload: MonetPayload = {
    v: 1,
    wid,
    uid: userId,
    ts: Date.now(),
    sha: sha
  };
  
  payload.sig = generateSignature(payload);
  const payloadStr = `${PAYLOAD_BEGIN_STR}${JSON.stringify(payload)}${PAYLOAD_END_STR}`;
  const payloadBytes = encoder.encode(payloadStr);
  
  // Create a new blob with the original file content + the watermark bytes
  const blob = new Blob([originalBuffer, payloadBytes], { type: file.type });
  
  return { watermarkedBlob: blob, payload };
};

export const verifyFile = async (file: File): Promise<VerificationResult> => {
  const fullBuffer = await file.arrayBuffer();
  const fullArray = new Uint8Array(fullBuffer);
  
  // We search for the bytes of the markers from the end of the file
  const beginIndex = lastIndexOfBytes(fullArray, PAYLOAD_BEGIN_BYTES);
  const endIndex = lastIndexOfBytes(fullArray, PAYLOAD_END_BYTES);
  
  if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) {
    return {
      verdict: Verdict.MISSING,
      confidence: 0,
      signatureScore: 0,
      integrityScore: 0,
      explanation: "No Monet watermark detected in the binary data.",
      evidence: { sigValid: false, hashMatch: false }
    };
  }

  try {
    // Extract the JSON payload part
    const jsonBytes = fullArray.slice(beginIndex + PAYLOAD_BEGIN_BYTES.length, endIndex);
    const jsonStr = decoder.decode(jsonBytes);
    const extracted: MonetPayload = JSON.parse(jsonStr);
    
    // FORENSIC STEP: Isolate the media content (everything before the watermark)
    const mediaContentBuffer = fullBuffer.slice(0, beginIndex);
    const currentMediaHash = await generateHashFromBuffer(mediaContentBuffer);

    const { sig, ...payloadWithoutSig } = extracted;
    const recalculatedSig = generateSignature(payloadWithoutSig as MonetPayload);
    const sigValid = sig === recalculatedSig;
    
    // Exact byte-level comparison
    const hashMatch = currentMediaHash === extracted.sha;

    let verdict = Verdict.VERIFIED;
    let confidence = 0.99;
    let signatureScore = sigValid ? 100 : 0;
    let integrityScore = hashMatch ? 100 : Math.floor(Math.random() * 40) + 10; // Random low score for demo if modified

    if (!sigValid) {
      verdict = Verdict.INVALID;
      confidence = 0.1;
      signatureScore = 5;
    } else if (!hashMatch) {
      verdict = Verdict.ALTERED;
      confidence = 0.95; 
      integrityScore = 42; // Example "modified" score
    }

    return {
      verdict,
      confidence,
      signatureScore,
      integrityScore,
      watermarkId: extracted.wid,
      explanation: "Analysis complete.",
      evidence: { sigValid, hashMatch }
    };
  } catch (e) {
    console.error("Verification error:", e);
    return {
      verdict: Verdict.INVALID,
      confidence: 0,
      signatureScore: 0,
      integrityScore: 0,
      explanation: "The embedded metadata is corrupted or malformed.",
      evidence: { sigValid: false, hashMatch: false }
    };
  }
};
