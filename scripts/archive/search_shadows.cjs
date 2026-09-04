const https = require('https');
https.get('https://unsplash.com/napi/search/photos?query=interior+shadows+concrete&per_page=5', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      json.results.forEach(r => {
        console.log(`ID: ${r.id} | ALT: ${r.alt_description}`);
      });
    } catch(e) { console.error(e.message); }
  });
});
