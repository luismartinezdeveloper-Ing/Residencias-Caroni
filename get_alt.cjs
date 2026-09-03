const https = require('https');
const ids = ['1510798831971-661eb04b3739', '1486406146926-c627a92ad1ab', '1497366216548-37526070297c', '1618221195710-dd6b41faaea6'];
ids.forEach(id => {
  https.get(`https://unsplash.com/photos/${id}`, res => {
    let data = '';
    res.on('data', c => data+=c);
    res.on('end', () => {
      const titleMatch = data.match(/<title>(.*?)<\/title>/);
      console.log(id, "->", titleMatch ? titleMatch[1] : 'No title');
    })
  });
});
