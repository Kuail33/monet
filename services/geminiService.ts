
import { GoogleGenAI } from "@google/genai";
import { VerificationResult, Verdict } from "../types";

// Fix: Correct initialization using named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY
});

export const generateVerificationReport = async (result: VerificationResult): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Please ensure your environment is configured.";
  }

  const prompt = `
    As a Senior Digital Forensic Specialist for Monet, generate a verification summary. The following data will be provided for analysis:
    
    FORENSIC DATA:
    - Verdict: ${result.verdict}
    - Signature Authenticity: ${result.signatureScore}% Valid
    - Content Integrity: ${result.integrityScore}% Match
    - Asset ID: ${result.watermarkId || 'None'}

    Context:
    - 100% Signature = Cryptographic certainty of the original creator.
    - 100% Integrity = Zero bit changes since protection.
    - Low Integrity with High Signature = The file belongs to the creator but has been edited/re-encoded (Stolen/Derivative).

    Scoring guide:
    - 90-100% Signature: Strong evidence of original authorship.
    - 70-89% Signature: Moderate evidence, possible minor alterations or encoding issues.
    - Below 70% Signature: Weak evidence, likely not the original creator.
    - 90-100% Integrity: No changes detected since protection.
    - 70-89% Integrity: Some changes detected, but core content remains intact.
    - Below 70% Integrity: Significant changes detected, content may be heavily altered or re-encoded.

    Discrepancies between signature and integrity scores can indicate potential theft or unauthorized modifications. For example, a high signature score with a low integrity score may suggest that while the file is likely created by the original author, it has been altered or re-encoded, which could be a sign of theft or derivative work.

    Expected output:
    - 1 sentence analysis summarizing the results.
    - 1 sentence describing the implications of the signature and integrity scores.

    The report should  be concise, clear, and suitable for users without any technical expertise. Focus on the implications of the results, especially any discrepancies between signature and integrity scores. Avoid technical jargons. Maintain professional, accessible tone. 
  `;

  try {
    // Fix: Call generateContent directly with model name and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Fix: Accessing text as a property, which is the correct way to extract output from GenerateContentResponse
    return response.text || "Report generation failed.";
  } catch (error) {
    return `Analysis: ${result.verdict}. Signature ${result.signatureScore}% valid. Integrity ${result.integrityScore}% matching original records.`;
  }
};
