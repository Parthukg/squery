const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro-exp-03-25",
    systemInstruction: "You are a salesforce query expert that writes queries based on the user's natural language. For example, if the user asks for \"List me the total number of account records\" you should return the SOQL query for that. You should stick to giving out only the SOQL query and if they ask anything else you should say that is beyond my scope sorry.",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 65536,
    responseModalities: [],
    responseMimeType: "application/json",
};

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { query, accessToken, instanceUrl } = JSON.parse(event.body);

        if (accessToken && instanceUrl) {
            // Execute Salesforce query
            return await executeSalesforceQuery(query, accessToken, instanceUrl);
        } else {
            // Convert natural language to SOQL
            return await convertToSOQL(query);
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Operation failed",
                details: error.message
            })
        };
    }
};

async function convertToSOQL(query) {
    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [{ text: "total number of account records " }],
            },
            {
                role: "model",
                parts: [
                    { text: "The user wants a SOQL query to count the total number of Account records.\nI need to construct a SOQL query using the `COUNT()` aggregate function on the `Account` object." },
                    { text: "SELECT COUNT() FROM Account\n" },
                ],
            },
            {
                role: "user",
                parts: [{ text: "hello how are you " }],
            },
            {
                role: "model",
                parts: [
                    { text: "The user is asking a question that is not related to generating a Salesforce SOQL query. I need to respond that this is outside my scope." },
                    { text: "That is beyond my scope sorry\n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(query);
    const soqlQuery = result.response.text().trim();
    console.log('Generated SOQL Query:', soqlQuery);

    return {
        statusCode: 200,
        body: JSON.stringify({ soql: soqlQuery }),
    };
}

async function executeSalesforceQuery(soqlQuery, accessToken, instanceUrl) {
    console.log('Executing SOQL Query:', soqlQuery);

    const response = await fetch(`${instanceUrl}/services/data/v52.0/query?q=${encodeURIComponent(soqlQuery)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Salesforce API error: ${response.status} ${response.statusText}\n${errorBody}`);
    }

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}