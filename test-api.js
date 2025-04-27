import https from 'https';

const data = JSON.stringify({
  model: 'NousResearch/Hermes-3-Llama-3.1-8B',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, are you working?' }
  ],
  temperature: 1.0,
  top_p: 1.0
});

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/ai/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'User-Agent': 'Node-Request',
    'Accept': 'application/vnd.github+json',
    'Authorization': 'Bearer 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',
    'X-GitHub-Api-Version': '2022-11-28'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:');
    console.log(responseData);
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

req.write(data);
req.end(); 