const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function analyzeProject(description) {
  const prompt = `
You are a technical project-role analyzer.

Analyze the following hackathon/project description.

Project:
${description}

Identify the technical skills required to build this project.

For each skill:
- Give the skill name
- Give an importance score from 1 to 10
- Give a short reason

Only include skills that are actually relevant to the project.

Return the result as JSON.
`;

  const models = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
  ];

  let lastError;

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    importance: {
                      type: "integer",
                    },
                    reason: {
                      type: "string",
                    },
                  },
                  required: ["name", "importance", "reason"],
                },
              },
            },
            required: ["skills"],
          },
        },
      });

      console.log(`Success with ${model}`);

      return JSON.parse(response.text);
    } catch (error) {
      lastError = error;

      console.log(`${model} failed.`);

      if (error.status !== 503) {
        throw error;
      }

      console.log("Model is temporarily unavailable. Trying next model...");

      await sleep(1000);
    }
  }

  throw lastError;
}

module.exports = {
  analyzeProject,
};