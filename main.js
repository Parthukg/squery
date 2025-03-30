document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('salesforce-login-button');
    
    loginButton.addEventListener('click', async function() {
        try {
            const response = await fetch('/.netlify/functions/salesforce-oauth-callback');
            console.log('Clicked.....')
            console.log(response)
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                //window.location.href = data.authorizationUrl;
            } else {
                console.error('Failed to initiate OAuth');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});