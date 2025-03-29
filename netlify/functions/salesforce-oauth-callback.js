// netlify/functions/salesforce-oauth-callback.js

export async function handler(event, context) {
  console.log("OAuth Callback Function Invoked!");

  // 1. Get the authorization code from the query parameters
  const authorizationCode = event.queryStringParameters.code;
  const state = event.queryStringParameters.state; // If you used a state parameter

  console.log("Authorization Code:", authorizationCode);
  console.log("State (if provided):", state);

  if (!authorizationCode) {
    return {
      statusCode: 400,
      body: "Error: No authorization code received."
    };
  }

  // 2.  ---  TOKEN EXCHANGE (This is the part you'll need to implement) ---
  // In a real application, you would now:
  //    - Make a POST request to Salesforce's token endpoint
  //    - Exchange the authorization code for access_token and refresh_token
  //    - Handle storing and using these tokens securely.
  //    - For this example, we'll just log that we received the code.

  console.log("---  Next step: Implement Token Exchange with Salesforce API  ---");
  console.log("---  You will need to use your Connected App's Consumer Key and Secret here  ---");

  // ---  Placeholder for Token Exchange API call (You'll replace this) ---
  // Example using fetch API (you might need to install 'node-fetch' if not in Node.js environment)
  // const tokenEndpoint = 'https://login.salesforce.com/services/oauth2/token'; // Or sandbox URL
  // const clientId = process.env.SALESFORCE_CLIENT_ID; // Securely get from environment variables
  // const clientSecret = process.env.SALESFORCE_CLIENT_SECRET; // Securely get from environment variables
  // const redirectUri = process.env.SALESFORCE_CALLBACK_URL; // MUST match your Connected App Callback URL
  // const grantType = 'authorization_code';
  //
  // const tokenParams = new URLSearchParams();
  // tokenParams.append('grant_type', grantType);
  // tokenParams.append('code', authorizationCode);
  // tokenParams.append('client_id', clientId);
  // tokenParams.append('client_secret', clientSecret);
  // tokenParams.append('redirect_uri', redirectUri);
  //
  // try {
  //   const response = await fetch(tokenEndpoint, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     body: tokenParams.toString()
  //   });
  //
  //   if (!response.ok) {
  //     console.error("Token exchange failed:", response.status, response.statusText);
  //     const errorData = await response.text(); // Or response.json() if expecting JSON error
  //     console.error("Error details:", errorData);
  //     return {
  //       statusCode: response.status,
  //       body: `Token exchange failed: ${response.status} ${response.statusText} - Details: ${errorData}`
  //     };
  //   }
  //
  //   const tokenData = await response.json();
  //   console.log("Token Response from Salesforce:", tokenData);
  //   // --- In a real app, you'd process tokenData (access_token, refresh_token, instance_url) here ---
  //
  //   return {
  //     statusCode: 200,
  //     body: "Successfully exchanged authorization code for tokens. Check function logs for token response."
  //   };
  //
  // } catch (error) {
  //   console.error("Error during token exchange:", error);
  //   return {
  //     statusCode: 500,
  //     body: `Error during token exchange: ${error.message}`
  //   };
  // }


  // 3.  Simple success response (for now)
  return {
    statusCode: 200,
    body: "Successfully received authorization code from Salesforce! Check function logs for details. Next step is to implement token exchange."
  };
}