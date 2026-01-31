
import { GoogleGenAI } from "@google/genai";
import { VerificationResult, Verdict } from "../types";

// Fix: Correct initialization using named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVerificationReport = async (result: VerificationResult): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Please ensure your environment is configured.";
  }

  const prompt = `
    As a Senior Digital Forensic Specialist for AuthMark, generate a verification summary.
    
    FORENSIC DATA:
    - Verdict: ${result.verdict}
    - Signature Authenticity: ${result.signatureScore}% Valid
    - Content Integrity: ${result.integrityScore}% Match
    - Asset ID: ${result.watermarkId || 'None'}

    Context:
    - 100% Signature = Cryptographic certainty of the original creator.
    - 100% Integrity = Zero bit changes since protection.
    - Low Integrity with High Signature = The file belongs to the creator but has been edited/re-encoded (Stolen/Derivative).

    Task: Provide a concise, professional report (max 2 sentences) that interprets these percentages for the end user.
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
