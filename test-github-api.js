const fetch = require('node-fetch');

async function testGitHubAI() {
  try {
    // Replace with your actual GitHub token
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      console.error('Error: GITHUB_TOKEN environment variable is not set');
      return;
    }

    const response = await fetch('https://api.github.com/copilot/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        model: 'NousResearch/Hermes-3-Llama-3.1-8B',
        messages: [
          { role: 'user', content: 'Hello, can you help me with a JavaScript question?' }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGitHubAI(); 