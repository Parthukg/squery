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
    console.log('HTTP Method:', event.httpMethod);
    console.log('Event Body:', event.body);
    
    // Handle POST request for initiating OAuth
    if (event.httpMethod === 'POST') {
        try {
            const { loginUrl } = JSON.parse(event.body);
            console.log('Received loginUrl:', loginUrl);
            const authorizationUrl = initiateOAuth(loginUrl);
            console.log('authorizationUrl', authorizationUrl);
            return {
                statusCode: 200,
                body: JSON.stringify({ authorizationUrl })
            };
        } catch (error) {
            console.error('Error processing POST request:', error);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Error processing request: " + error.message })
            };
        }
    }

    // Handle GET request for OAuth callback
    if (event.httpMethod === 'GET') {
        // ... (rest of your GET handling code remains the same)
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request method" })
    };
}