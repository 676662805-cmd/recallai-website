// Wrap the Express app with serverless-http so Vercel (and other serverless
// platforms) can invoke it as a function.
const server = require('../server.js');
const serverless = require('serverless-http');

module.exports = serverless(server);
