const fs = require('fs');
const http = require('http');

http.get('http://localhost:3000/api/perfil/loyg8tpi4pxa/vcard', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('test.vcf', data);
    console.log("Saved test.vcf");
  });
});
