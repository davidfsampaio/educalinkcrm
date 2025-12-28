
import { GoogleGenAI } from "@google/genai";

export const generateText = async (prompt: string): Promise<string> => {
  // FIX: Using process.env.API_KEY directly for initialization as per guidelines.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // If the API key is not available, guide the user to the activation flow.
    const errorMessage = "O Serviço de IA não está configurado. Por favor, ative a IA para usar este recurso.";
    return errorMessage;
  }

  // FIX: Always use a new client instance with current process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // FIX: Updated model name to 'gemini-3-flash-preview' for basic text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // FIX: Accessing .text property directly (not calling it as a method).
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar texto com Gemini:", error);
    if (error instanceof Error) {
        // Common error messages for invalid/revoked API keys.
        // Return a special identifier for the UI to handle re-authentication.
        if (error.message.includes('API key not valid') || error.message.includes('was not found')) {
            return "API_KEY_INVALID";
        }
        return `Erro do Gemini: ${error.message}`;
    }
    return "Ocorreu um erro desconhecido ao contatar o modelo de IA.";
  }
};
