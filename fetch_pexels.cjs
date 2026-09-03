const https = require('https');
function getImgs(query) {
  const options = {
    hostname: 'www.pexels.com',
    path: '/search/' + encodeURIComponent(query) + '/',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  };
  https.get(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const regex = /<img[^>]+src="([^">]+images\.pexels\.com\/photos[^">]+)"/g;
      let match;
      let i = 0;
      console.log("Q: " + query);
      while ((match = regex.exec(data)) !== null && i < 3) {
        console.log(match[1].split('?')[0]); // get base url
        i++;
      }
    });
  });
}
getImgs('luxury apartment balcony view');
getImgs('modern concrete architecture interior');
getImgs('shadow architecture interior');
getImgs('luxury modern apartment living room');
