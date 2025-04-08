const { createProxyMiddleware } = require('http-proxy-middleware');
const { BACKEND_PORT } = require('./config.json')
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${BACKEND_PORT}`,
      changeOrigin: true,
    })
  );
};