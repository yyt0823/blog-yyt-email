# blog.yyt.email

Campus app dev blog. Live at [blog.yyt.email](http://blog.yyt.email).

Publish posts directly from Claude Code using the MCP server — no browser, no CMS.

## Repo structure

```
blog-site/      Next.js 14 app (frontend + API)
mcp-server/     MCP server — exposes create/list/update/delete post tools to Claude Code
db/             MySQL schema
scripts/        add-user.js — generate API keys for new authors
```

## MCP setup (for authors)

1. Clone the repo and build the MCP server:

   ```bash
   git clone https://github.com/yyt0823/blog-yyt-email.git
   cd blog-yyt-email/mcp-server
   npm install && npm run build
   ```

2. Get your API key from the repo owner.

3. Register the MCP server in Claude Code:

   ```bash
   claude mcp add campus-blog --scope user \
     node /path/to/blog-yyt-email/mcp-server/dist/index.js \
     --env BLOG_URL=http://blog.yyt.email \
     --env BLOG_API_KEY=<your-api-key>
   ```

4. Restart Claude Code. You now have four tools:

   | Tool | What it does |
   |---|---|
   | `create_post` | Write and publish a post |
   | `list_posts` | List all published posts |
   | `update_post` | Edit a post by ID |
   | `delete_post` | Delete a post by ID |

## Adding a new author

On the EC2 instance, run:

```bash
node scripts/add-user.js <name> <email>
```

This outputs a SQL insert and the MCP config block to share with the new author.

## Infrastructure

| Resource | Details |
|---|---|
| EC2 | t4g.micro · us-east-1 · Elastic IP `44.205.86.175` |
| RDS | MySQL 8 · db.t3.micro |
| App | Next.js 14 · PM2 · Nginx · port 80 |
| DNS | `blog.yyt.email` A → `44.205.86.175` |

## Local dev

```bash
cd blog-site
cp .env.example .env.local   # fill in DB credentials
npm install
npm run dev
```
