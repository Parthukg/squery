import fetch from 'node-fetch';
//import cookie from 'cookie';

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


function setCookie(name, value, options = {}) {
    const cookieOptions = {
      HttpOnly: true,
      Secure: true,
      SameSite: 'Strict',
      'Max-Age': 3600, // 1 hour
      Path: '/',
      ...options
    };
  
    const cookieString = Object.entries(cookieOptions).reduce((acc, [key, value]) => {
      if (value === true) return `${acc}${key};`;
      if (value === false) return acc;
      return `${acc}${key}=${value};`;
    }, `${name}=${value};`);
  
    return cookieString;
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
            
            const accessTokenCookie = setCookie('sf_access_token', tokenResponse.access_token);
      const instanceUrlCookie = setCookie('sf_instance_url', tokenResponse.instance_url);
      const combinedCookies = `${accessTokenCookie} ${instanceUrlCookie}`;

            // Redirect to homepage with token information
            return {
                statusCode: 302,
                headers: {
                    'Location': '/homepage.html',
                    'Set-Cookie': combinedCookies
                }
            };
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            return {
                statusCode: 302,
                headers: {
                    'Location': '/index.html?error=Error_during_token_exchange'
                }
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