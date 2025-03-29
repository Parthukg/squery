document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('salesforce-login-button');
    
    loginButton.addEventListener('click', async function() {
        try {
            const response = await fetch('/.netlify/functions/salesforce-oauth-callback');
            if (response.ok) {
                const data = await response.json();
                window.location.href = data.authorizationUrl;
            } else {
                console.error('Failed to initiate OAuth');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});