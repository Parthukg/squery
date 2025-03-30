import fetch from 'node-fetch';

function initiateOAuth(loginUrl) {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    console.log('clientId', clientId);
    const redirectUri = encodeURIComponent(process.env.SALESFORCE_CALLBACK_URL);
    const prompt = encodeURIComponent('login consent');
    const state = Date.now().toString();
    return `${loginUrl}/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&prompt=${prompt}&state=${state}`;
}

export async function handler(event, context) {
    console.log('Function invoked. HTTP Method:', event.httpMethod);
    console.log('Request body:', event.body);
    console.log('Query parameters:', event.queryStringParameters);

    if (event.httpMethod === 'POST') {
        try {
            const { loginUrl } = JSON.parse(event.body);
            console.log('Received loginUrl:', loginUrl);
            const authorizationUrl = initiateOAuth(loginUrl);
            console.log('Generated authorizationUrl:', authorizationUrl);
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
    } else if (event.httpMethod === 'GET') {
        // Your existing GET handling code
    } else {
        console.log('Unsupported HTTP method:', event.httpMethod);
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }
}