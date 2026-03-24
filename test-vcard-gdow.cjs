const http = require('http');

http.get('http://localhost:3000/api/perfil/gdow4rsx5ztj/vcard', (res) => {
  let data = Buffer.alloc(0);
  res.on('data', (chunk) => {
    data = Buffer.concat([data, chunk]);
  });
  res.on('end', () => {
    console.log(data.toString('utf8').substring(0, 500));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
