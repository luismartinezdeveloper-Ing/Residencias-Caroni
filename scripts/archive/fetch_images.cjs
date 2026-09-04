const https = require('https');

function search(query) {
  const options = {
    hostname: 'unsplash.com',
    path: '/napi/search/photos?query=' + encodeURIComponent(query) + '&per_page=10',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  };
  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log("QUERY: " + query);
        json.results.slice(0, 5).forEach(r => {
          console.log(`- ID: ${r.id} | ALT: ${r.alt_description}`);
        });
      } catch(e) {
        // console.error(e.message);
      }
    });
  });
}

search('brutalist apartment');
search('modern condo interior');
search('architectural shadows interior');
search('concrete apartment living room');
