import express from 'express';
const app = express();
app.get('*all', (req, res) => res.send('catchall'));
const server = app.listen(3001, async () => {
  console.log('started');
  const res = await fetch('http://localhost:3001/some/random/path');
  const text = await res.text();
  console.log('Response:', text);
  process.exit(0);
});
