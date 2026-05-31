#!/usr/bin/env node
const crypto = require('crypto');

const [,, name, email] = process.argv;
if (!name || !email) {
  console.error('Usage: node scripts/add-user.js <name> <email>');
  process.exit(1);
}

const apiKey = 'bk_' + crypto.randomBytes(32).toString('hex');

console.log('\n--- Run this SQL to register the user ---\n');
console.log(`INSERT INTO users (name, email, api_key) VALUES ('${name}', '${email}', '${apiKey}');`);
console.log('\n--- Share this config with the user ---\n');
console.log('Add to ~/.claude/settings.json (merge into existing mcpServers block):\n');
console.log(JSON.stringify({
  mcpServers: {
    "campus-blog": {
      command: "node",
      args: ["<path-to>/mcp-server/dist/index.js"],
      env: {
        BLOG_URL: "https://blog.yyt.email",
        BLOG_API_KEY: apiKey
      }
    }
  }
}, null, 2));
