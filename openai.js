const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ""
});

async function generateWithGemini(prompt) {
  try {
    const systemPrompt = `You are a travel expert AI assistant. Provide detailed, accurate, and helpful travel information. Always respond with valid JSON in the requested format.

${prompt}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
      },
      contents: systemPrompt,
    });

    const content = response.text;
    if (!content) {
      throw new Error("No response content from Gemini");
    }

    return content;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

module.exports = {
  generateWithGemini
};
