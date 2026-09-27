import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

export const generateFAQ = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  const response = await ai.models.generateContent({
    model,
    contents: `
You are an AI FAQ content assistant.

Create one useful FAQ from the user's topic.

Return ONLY valid JSON with this exact structure:
{
  "question": "string",
  "answer": "string",
  "topicSuggestions": ["string", "string", "string"]
}

User topic:
${prompt}
`,
    config: {
      responseMimeType: "application/json"
    }
  });

  const data = JSON.parse(response.text);

  if (!data.question || !data.answer) {
    throw new Error("Gemini returned incomplete FAQ data");
  }

  return {
    question: data.question,
    answer: data.answer,
    topicSuggestions: Array.isArray(data.topicSuggestions)
      ? data.topicSuggestions
      : []
  };
};

export const generateAnswer = async (question, context = "") => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  const response = await ai.models.generateContent({
    model,
    contents: `
Answer the user's FAQ question clearly and briefly.

Use the provided FAQ context when it is relevant.
Do not invent facts when the context is insufficient.

Question:
${question}

FAQ Context:
${context}
`
  });

  return response.text;
};
