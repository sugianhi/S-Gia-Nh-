const https = require('https');
https.get('https://vi.wikipedia.org/wiki/Chim_L%E1%BA%A1c', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/<img[^>]+src="([^">]+Chim_L%E1%BA%A1c[^">]+)"/i);
    if (match) {
      console.log(match[1]);
    } else {
      console.log("Not found");
    }
  });
});
