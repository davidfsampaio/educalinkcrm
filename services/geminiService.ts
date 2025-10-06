import { GoogleGenAI } from "@google/genai";

// IMPORTANT: Do not expose the API key in the frontend in a real application.
// This is for demonstration purposes only. In a production environment,
// this should be handled via a backend server.

// FIX: Aligned with @google/genai guidelines, which state to assume API_KEY is always present and use it directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateText = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    if (error instanceof Error) {
        return `Error from Gemini: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI model.";
  }
};