import fetch from 'node-fetch';

function initiateOAuth(loginUrl) {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    console.log('clientId', clientId);
    const redirectUri = encodeURIComponent(process.env.SALESFORCE_CALLBACK_URL);
    const prompt = encodeURIComponent('login consent');
    const state = Date.now().toString();
    return `${loginUrl}/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&prompt=${prompt}&state=${state}`;
}

async function exchangeCodeForToken(code, loginUrl) {
    const tokenUrl = `${loginUrl}/services/oauth2/token`;
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const redirectUri = process.env.SALESFORCE_CALLBACK_URL;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);

    const response = await fetch(tokenUrl, {
        method: 'POST',
        body: params,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Token exchange error:', response.status, errorBody);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function handler(event, context) {
    console.log('Function invoked. HTTP Method:', event.httpMethod);
    console.log('Request body:', event.body);
    console.log('Query parameters:', event.queryStringParameters);

    if (event.httpMethod === 'POST') {
        try {
            const { loginUrl } = JSON.parse(event.body);
            if (!loginUrl) {
                throw new Error('loginUrl is required');
            }
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
        const code = event.queryStringParameters.code;
        const error = event.queryStringParameters.error;
        const loginUrl = event.queryStringParameters.loginUrl || 'https://login.salesforce.com'; // Default to production URL

        if (error) {
            console.error('OAuth Error:', error);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error })
            };
        }

        if (!code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No authorization code received" })
            };
        }

        try {
            const tokenResponse = await exchangeCodeForToken(code, loginUrl);
            console.log('Token Response:', tokenResponse);

            // Here you would typically save the access_token, refresh_token, and other details
            // For this example, we're just returning a success message with partial token info
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*', // Be more specific in production
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Successfully authenticated with Salesforce",
                    access_token: tokenResponse.access_token,
                    instance_url: tokenResponse.instance_url
                })
            };
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*', // Be more specific in production
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: "Error during token exchange" })
            };
        }
    } else {
        console.log('Unsupported HTTP method:', event.httpMethod);
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }
}