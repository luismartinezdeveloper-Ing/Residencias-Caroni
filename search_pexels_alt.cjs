const https = require('https');
https.get('https://www.pexels.com/search/concrete%20shadows%20interior/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const regex = /<img[^>]+alt="([^"]+)"[^>]+src="([^">]+images\.pexels\.com\/photos[^">]+)"/g;
    let match;
    let i = 0;
    while ((match = regex.exec(data)) !== null && i < 10) {
      console.log(`ALT: ${match[1]}\nURL: ${match[2].split('?')[0]}\n`);
      i++;
    }
  });
});
