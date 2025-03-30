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
});