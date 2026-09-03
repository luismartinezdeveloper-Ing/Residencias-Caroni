const https = require('https');

function check(id) {
  const url = `https://source.unsplash.com/${id}/800x600`;
  https.get(url, (res) => {
    console.log(`ID: ${id} -> Location: ${res.headers.location}`);
  });
}

const ids = [
  'M7GddPqJowg',
  'aL8zO4b9Obo',
  'h0Vxgz5tyXA',
  'XbL2E66Lms0',
  'YnB_N6k8ZLQ',
  'm_7p45JfXQo',
  'J2e34-1CVVs',
  'vXInUOv1n84',
  'Z2imT5B5Ew8',
  'jOQG8yPjW3g',
  '2rOWhEQ9sS0'
];
ids.forEach(check);
