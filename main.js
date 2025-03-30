document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('salesforce-login-button');
    const environmentSelect = document.getElementById('salesforce-environment');
  
    loginButton.addEventListener('click', async function() {
        try {
            const selectedEnvironment = environmentSelect.value;
            const response = await fetch('/.netlify/functions/salesforce-oauth-callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginUrl: selectedEnvironment })
            });
            console.log('Clicked.....');
            console.log(response);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                window.location.href = data.authorizationUrl;
            } else {
                console.error('Failed to initiate OAuth');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});