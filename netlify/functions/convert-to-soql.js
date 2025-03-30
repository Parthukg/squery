const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro-exp-03-25",
    systemInstruction: "You are a salesforce query expert that writtens query based on the users natural language. For example, if the user asks for \"List me the total number of account records\" and it should return the soql query for that. You should stick to giving out only the soql query and if they ask anything else you should say that is beyond my scope sorry.",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 65536,
    responseModalities: [
    ],
    responseMimeType: "application/json",
  };

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { query } = JSON.parse(event.body);

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "total number of account records "},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "The user wants a SOQL query to count the total number of Account records.\nI need to construct a SOQL query using the `COUNT()` aggregate function on the `Account` object."},
            {text: "{\n  \"query\": \"SELECT COUNT() FROM Account\"\n}"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "hello how are you "},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "The user is asking a question that is not related to generating a Salesforce SOQL query. I need to respond that this is outside my scope."},
            {text: "{\n  \"query\": \"That is beyond my scope sorry\"\n}"},
          ],
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
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: "Failed to convert query",
        details: error.message
      })
    };
  }
};