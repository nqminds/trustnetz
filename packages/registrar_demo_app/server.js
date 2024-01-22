const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require('express');

const VCRestAPIAddress = "http://localhost:3000";
const RegistrarAPIAddress = "http://localhost:3001";

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3002

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  console.log("setting up server...")
  const server = express();

  // Apply middleware to parse JSON bodies
  server.use(express.json());

  // Example route for proxying API requests
  server.all('/api/vc/*', async (req, res) => {
    let apiUrl = null;
    try {
      // Extract headers, body, and URL parameters from the original request
      const { headers, body } = req;
      const reqUrlTail = req.url.replace(/^\/api\/vc/, '');
      apiUrl = `${VCRestAPIAddress}${reqUrlTail}`; // Forward the entire URL
      console.log("got request to /api/vc, forwarding...", apiUrl);
      const options = {
        method: req.method,
        headers: {...headers},
      };
      if (body && req.method === "POST") {
        options.body = JSON.stringify(body);
      }
      // Forward the request to the internal API
      const internalApiResponse = await fetch(apiUrl, options);
      // Check if the internal API response is successful (status code 2xx)
      if (internalApiResponse.ok) {
        const responseData = await internalApiResponse.json();
        // Send the extracted JSON data to the client
        res.json(responseData);
      } else {
        // If the internal API response is not successful, send an error status
        res.status(internalApiResponse.status).json({
          error: 'Internal API Error',
          status: internalApiResponse.status,
        });
      }
    } catch (error) {
      console.error(`Error forwarding request for ${apiUrl}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Example route for proxying API requests
  server.all('/api/registrar/*', async (req, res) => {
    let apiUrl = null;
    try {
      // Extract headers, body, and URL parameters from the original request
      const { headers, body } = req;
      const reqUrlTail = req.url.replace(/^\/api\/registrar/, '');
      apiUrl = `${RegistrarAPIAddress}${reqUrlTail}`; // Forward the entire URL
      // Forward the request to the internal API
      const options = {
        method: req.method,
        headers: {...headers},
      };
      if (body && req.method === "POST") {
        options.body = JSON.stringify(body);
      }
      // Forward the request to the internal API
      const internalApiResponse = await fetch(apiUrl, options);

      // Check if the internal API response is successful (status code 2xx)
      if (internalApiResponse.ok) {
        const responseData = await internalApiResponse.json();
        // Send the extracted JSON data to the client
        res.json(responseData);
      } else {
        // If the internal API response is not successful, send an error status
        res.status(internalApiResponse.status).json({
          error: 'Internal API Error',
          status: internalApiResponse.status,
        });
      }
    } catch (error) {
      console.error(`Error forwarding request for ${apiUrl}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Handle other Next.js routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || port;

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});