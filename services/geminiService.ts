import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const describeImage = async (base64Image: string, language: Language): Promise<string> => {
  try {
    // Clean base64 string if it includes the data URL prefix
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const prompt = `
      You are a helpful visual assistant for a blind person. 
      Look at the image and describe what is happening or what objects are present.
      The user needs to know what is in front of them to navigate or understand their surroundings.
      
      CRITICAL: You MUST reply ONLY in ${language}. 
      Keep the response concise, clear, and under 2 sentences.
      Do not use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "I could not see anything clearly.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze image. Please check your connection.");
  }
};
