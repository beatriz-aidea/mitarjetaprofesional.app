const http = require('http');
http.get('http://localhost:3000/gdow4rsx5ztj', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data.substring(0, 100)));
});
