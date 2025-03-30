document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('salesforce-login-form');
    const environmentSelect = document.getElementById('salesforce-environment');
  
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        try {
            const selectedEnvironment = environmentSelect.value;
            console.log('Selected environment:', selectedEnvironment);
            
            const response = await fetch('/.netlify/functions/salesforce-oauth-callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginUrl: selectedEnvironment })
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                if (data.authorizationUrl) {
                    window.location.href = data.authorizationUrl;
                } else {
                    console.error('No authorization URL in response');
                }
            } else {
                console.error('Failed to initiate OAuth');
                const errorData = await response.text();
                console.error('Error details:', errorData);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });


    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code || error) {
        handleOAuthCallback();
    }

    // Add this new function to your main.js
    async function handleOAuthCallback() {
        console.log('handleOAuthCallback' , handleOAuthCallback)
        const urlParams = new URLSearchParams(window.location.search);
        console.log('urlParams' , urlParams)
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth Error:', error);
            return;
        }

        try {
            const response = await fetch(`/.netlify/functions/salesforce-oauth-callback?code=${code}`);
            if (!response.ok) {
                throw new Error('Failed to exchange code for token');
            }

            const data = await response.json();
            console.log('Login successful:', data);

            // Store tokens securely
            sessionStorage.setItem('accessToken', data.access_token);
            sessionStorage.setItem('instanceUrl', data.instance_url);

            // Redirect to homepage
            window.location.href = 'homepage.html';
        } catch (error) {
            console.error('Error during OAuth callback:', error);
        }
    }
});