const https = require('https');
https.get("https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFRPQFWmGJIDlJCIC_QQJTWaJgliPh_rBlfy7xgLSOSS2PCc0B9FyCItbYSNFLzVvbpPxnsI3KdCzUAzfu_T1KGeJuAJtBUplYLhowYThdh4WsmH2LSXKqtJrAiQ34tG5RHWC1LuFcKbX2OmzS_POYItn6GOeUKc4EMXYJKQa_9cMr9CLIam6ZThmbRGvKoGCGYMB1p7I8=", (res) => {
  console.log("Loc:", res.headers.location);
});
