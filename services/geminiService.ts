import { GoogleGenAI } from "@google/genai";
import { WritingMode } from "../types";
import { SYSTEM_INSTRUCTIONS } from "../constants";

// Initialize Gemini Client
// Ensure process.env.API_KEY is available in your environment configuration
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * The Core Generation Function
 * Handles the logic of selecting the right model and prompt strategy.
 */
export const generateWriting = async (
  text: string,
  mode: WritingMode,
  onChunk: (chunk: string) => void
): Promise<string> => {
  if (!text.trim()) return "";

  const template = SYSTEM_INSTRUCTIONS[mode];
  
  // We use gemini-3-flash-preview for fast, high-quality text generation
  const modelName = 'gemini-3-flash-preview';

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: template.userPromptWrapper(text) }]
        }
      ],
      config: {
        systemInstruction: template.systemInstruction,
        temperature: 0.7, // Slightly creative for drafting, can be lowered for refining
        maxOutputTokens: 8192, // Allow for long essays
      }
    });

    let fullText = "";

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }

    return fullText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Augustus encountered an error while thinking. Please check your API key or try again.");
  }
};