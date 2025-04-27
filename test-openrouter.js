// Test for OpenRouter API key
import fetch from 'node-fetch';

// Use the API key directly for testing
const API_KEY = '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';

async function testOpenRouterAPI() {
  console.log('Testing OpenRouter API connection...');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API key valid. Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const error = await response.text();
      console.error('Error response:', error);
      return false;
    }
  } catch (error) {
    console.error('Exception while testing API:', error);
    return false;
  }
}

// Run the test
testOpenRouterAPI()
  .then(isValid => {
    console.log('API key valid:', isValid);
    if (!isValid) {
      console.log('Please check your OpenRouter API key or create a new one at https://openrouter.ai/keys');
    }
  })
  .catch(err => {
    console.error('Test failed with error:', err);
  }); 