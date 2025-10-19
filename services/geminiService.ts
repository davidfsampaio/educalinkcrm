import { GoogleGenAI } from "@google/genai";

// FIX: Refactored the Gemini service to align with the provided coding guidelines.
// This resolves the TypeScript error `Property 'env' does not exist on type 'ImportMeta'`
// by using `process.env.API_KEY` instead of `import.meta.env.VITE_GEMINI_API_KEY`.
// The client is initialized once at module load time and reused.
const apiKey = process.env.API_KEY;
const ai: GoogleGenAI | null = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
  // Log an error if the key is missing.
  console.error("A variável de ambiente API_KEY não está definida. Os recursos de IA estão desativados.");
}

export const generateText = async (prompt: string): Promise<string> => {
  // If the client could not be initialized (e.g., missing API key), return an error message.
  if (!ai) {
    const errorMessage = "O Serviço de IA não está configurado. Certifique-se de que o API_KEY esteja definido.";
    return errorMessage;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar texto com Gemini:", error);
    if (error instanceof Error) {
        return `Erro do Gemini: ${error.message}`;
    }
    return "Ocorreu um erro desconhecido ao contatar o modelo de IA.";
  }
};
