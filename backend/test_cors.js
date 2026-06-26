const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/profiles',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://celebreties-profile.vercel.app',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', JSON.stringify(res.headers, null, 2));
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
