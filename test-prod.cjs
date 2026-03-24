const http = require('http');
const { spawn } = require('child_process');

const server = spawn('npm', ['run', 'start'], { env: { ...process.env, NODE_ENV: 'production' } });

server.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  if (data.toString().includes('Server running')) {
    http.get('http://localhost:3000/gdow4rsx5ztj', (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        console.log(res.statusCode, d.substring(0, 100));
        server.kill();
      });
    });
  }
});

server.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
