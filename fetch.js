// fetch.js
const https = require("https");

const threshold = 60; // Change this to your trigger level
const webhookURL = "https://your-webhook-url.com"; // <- Replace this

https.get("https://api.alternative.me/fng/", (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      const value = parseInt(json.data[0].value);

      console.log(`Current Fear & Greed Index: ${value}`);

      if (value >= threshold) {
        console.log(`Threshold exceeded: ${value} >= ${threshold}`);

        const payload = JSON.stringify({
          signal: "sentiment_trigger",
          source: "FGI",
          value: value,
        });

        const options = new URL(webhookURL);
        const req = https.request(
          {
            hostname: options.hostname,
            path: options.pathname,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            },
          },
          (res) => {
            console.log(`Webhook sent. Status: ${res.statusCode}`);
          }
        );

        req.on("error", (err) => {
          console.error("Webhook error:", err.message);
        });

        req.write(payload);
        req.end();
      } else {
        console.log(`Below threshold: ${value} < ${threshold}`);
      }
    } catch (err) {
      console.error("Failed to parse FGI data:", err.message);
    }
  });
}).on("error", (err) => {
  console.error("Failed to fetch FGI:", err.message);
});
