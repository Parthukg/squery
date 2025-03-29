import fetch from 'node-fetch';

function initiateOAuth() {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.SALESFORCE_CALLBACK_URL);
    const loginUrl = 'https://login.salesforce.com/services/oauth2/authorize';
    return `${loginUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
}

export async function handler(event, context) {
    // Check if this is an OAuth initiation request
    console.log('Enter function')
    if (event.httpMethod === 'GET' && !event.queryStringParameters.code) {
        const authorizationUrl = initiateOAuth();
        return {
            statusCode: 200,
            body: JSON.stringify({ authorizationUrl })
        };
    }

    // If it's not an initiation request, assume it's the OAuth callback
    console.log("OAuth Callback Function Invoked!");

    const authorizationCode = event.queryStringParameters.code;

    if (!authorizationCode) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "No authorization code received." })
        };
    }

    // Token Exchange
    const tokenEndpoint = 'https://login.salesforce.com/services/oauth2/token';
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const redirectUri = process.env.SALESFORCE_CALLBACK_URL;
    const grantType = 'authorization_code';

    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', grantType);
    tokenParams.append('code', authorizationCode);
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);
    tokenParams.append('redirect_uri', redirectUri);

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams.toString()
        });

        if (!response.ok) {
            console.error("Token exchange failed:", response.status, response.statusText);
            const errorData = await response.text();
            console.error("Error details:", errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Token exchange failed: ${response.status} ${response.statusText}`, details: errorData })
            };
        }

        const tokenData = await response.json();
        console.log("Token Response from Salesforce:", tokenData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Successfully exchanged authorization code for tokens.",
                access_token: tokenData.access_token.substring(0, 10) + '...', // Only return first 10 chars for security
                instance_url: tokenData.instance_url,
            })
        };

    } catch (error) {
        console.error("Error during token exchange:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Error during token exchange: ${error.message}` })
        };
    }
}