import { GoogleGenAI } from "@google/genai";

// Ensure the API key is handled as per the guidelines.
// It MUST come from process.env.API_KEY.
if (!process.env.API_KEY) {
    // In a real app, this might be handled more gracefully,
    // but for this project, we'll log a clear error.
    console.error("API_KEY environment variable not set. The application will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Generates content using the specified model and prompt.
 * @param prompt The text prompt to send to the model.
 * @param model The model to use (defaults to gemini-2.5-flash).
 * @returns The generated text from the model.
 */
const generateText = async (prompt: string, model: string = 'gemini-2.5-flash'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Error: Could not get a response from the AI model.";
    }
};

export const aiService = {
    generateText,
};
