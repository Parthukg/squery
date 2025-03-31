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

    console.log('URL parameters:', urlParams.toString());
    console.log('Code:', code);
    console.log('Error:', error);

    if (code) {
        console.log('Code detected, calling handleOAuthCallback');
        handleOAuthCallback(code);
    } else if (error) {
        console.error('OAuth Error:', error);
    } else {
        console.log('No code or error in URL parameters');
    }

    async function handleOAuthCallback(code) {
        console.log('Handling OAuth callback with code:', code);
        try {
            const response = await fetch(`/.netlify/functions/salesforce-oauth-callback?code=${code}`);
            console.log('Received response from server:', response.status);
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error details:', errorData);
                throw new Error('Failed to exchange code for token');
            }
    
            console.log('Login successful. Received data:', data);
    
            // Redirect to homepage
            console.log('Attempting to redirect to homepage.html');
            window.location.href = 'homepage.html';
            
            // If the above doesn't work, try this:
            // window.location.replace('homepage.html');
        } catch (error) {
            console.error('Error during OAuth callback:', error);
        }
    }
});