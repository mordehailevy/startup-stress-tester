// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json)
// and handled by the compiled Express backend.
module.exports = require("../backend/dist/serverless/handler").default;
