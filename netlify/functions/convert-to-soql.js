const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 2048,
  },
});

const systemInstruction = "You are a Salesforce query expert that writes SOQL queries based on the user's natural language input. For example, if the user asks for 'List me the total number of account records', you should return the SOQL query for that. Provide only the SOQL query without any additional explanation. If asked anything outside of SOQL query generation, respond with 'Sorry, that's beyond my scope.'";

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { query } = JSON.parse(event.body);

    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'll generate SOQL queries based on natural language input. I'll only provide the query without additional explanation." }],
        },
      ],
    });

    const result = await chatSession.sendMessage(query);
    const soqlQuery = result.response.text().trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ soql: soqlQuery }),
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to convert query" }) };
  }
};