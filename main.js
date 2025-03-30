document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('salesforce-login-form');
    const environmentSelect = document.getElementById('salesforce-environment');
  
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form from submitting normally
        
        try {
            const selectedEnvironment = environmentSelect.value;
            const response = await fetch('/.netlify/functions/salesforce-oauth-callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginUrl: selectedEnvironment })
            });
            console.log('Form submitted.....');
            console.log(response);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                window.location.href = data.authorizationUrl;
            } else {
                console.error('Failed to initiate OAuth');
                const errorData = await response.text();
                console.error('Error details:', errorData);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});