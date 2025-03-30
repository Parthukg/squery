import fetch from 'node-fetch';

function initiateOAuth(loginUrl) {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    console.log('clientId', clientId);
    const redirectUri = encodeURIComponent(process.env.SALESFORCE_CALLBACK_URL);
    const prompt = 'login consent';
    const state = Date.now().toString();
    return `${loginUrl}/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&prompt=${prompt}&state=${state}`;
}

export async function handler(event, context) {
    console.log('Enter function');
    
    // Handle POST request for initiating OAuth
    if (event.httpMethod === 'POST') {
        const { loginUrl } = JSON.parse(event.body);
        const authorizationUrl = initiateOAuth(loginUrl);
        console.log('authorizationUrl', authorizationUrl);
        return {
            statusCode: 200,
            body: JSON.stringify({ authorizationUrl })
        };
    }

    // Handle GET request for OAuth callback
    if (event.httpMethod === 'GET') {
        if (event.queryStringParameters.error) {
            console.error('OAuth Error:', event.queryStringParameters.error, event.queryStringParameters.error_description);
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: event.queryStringParameters.error, 
                    description: event.queryStringParameters.error_description 
                })
            };
        }

        const authorizationCode = event.queryStringParameters.code;

        if (!authorizationCode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No authorization code received." })
            };
        }

        // Token Exchange
        // ... (rest of your token exchange code remains the same)
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request method" })
    };
}