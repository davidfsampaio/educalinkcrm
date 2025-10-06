import { GoogleGenAI } from "@google/genai";

// FIX: Refactored the Gemini service to align with the provided coding guidelines.
// This resolves the TypeScript error `Property 'env' does not exist on type 'ImportMeta'`
// by using `process.env.API_KEY` instead of `import.meta.env.VITE_GEMINI_API_KEY`.
// The client is initialized once at module load time and reused.
const apiKey = process.env.API_KEY;
const ai: GoogleGenAI | null = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
  // Log an error if the key is missing.
  console.error("API_KEY environment variable not set. AI features are disabled.");
}

export const generateText = async (prompt: string): Promise<string> => {
  // If the client could not be initialized (e.g., missing API key), return an error message.
  if (!ai) {
    const errorMessage = "AI Service is not configured. Ensure the API_KEY is set.";
    return errorMessage;
  }

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
