import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

const BLOG_URL = (process.env.BLOG_URL ?? 'https://blog.yyt.email').replace(/\/$/, '');
const API_KEY = process.env.BLOG_API_KEY ?? '';

const server = new Server(
  { name: 'campus-blog', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const tools: Tool[] = [
  {
    name: 'create_post',
    description: 'Create a new post on the campus app dev blog. Defaults to published.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Post title' },
        content: { type: 'string', description: 'Post body in markdown' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Topic tags e.g. ["kafka", "architecture", "react-native"]',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'draft or published (default: published)',
        },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'list_posts',
    description: 'List all published posts on the campus app dev blog',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'update_post',
    description: 'Update an existing post. You can only edit posts you authored.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Post ID (from list_posts)' },
        title: { type: 'string' },
        content: { type: 'string', description: 'Full markdown content (replaces existing)' },
        tags: { type: 'array', items: { type: 'string' } },
        status: { type: 'string', enum: ['draft', 'published'] },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_post',
    description: 'Delete a post. You can only delete posts you authored.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Post ID (from list_posts)' },
      },
      required: ['id'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  if (!API_KEY) {
    return {
      content: [{ type: 'text', text: 'Error: BLOG_API_KEY is not set in your MCP environment config.' }],
    };
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    switch (name) {
      case 'list_posts': {
        const res = await fetch(`${BLOG_URL}/api/posts`);
        const posts: any[] = await res.json();
        if (!posts.length) {
          return { content: [{ type: 'text', text: 'No published posts yet.' }] };
        }
        const text = posts
          .map(
            p =>
              `[ID ${p.id}] ${p.title}\n` +
              `  Author: ${p.author_name}  ·  ${new Date(p.published_at).toDateString()}\n` +
              `  URL: ${BLOG_URL}/${p.slug}`
          )
          .join('\n\n');
        return { content: [{ type: 'text', text }] };
      }

      case 'create_post': {
        const body = { status: 'published', ...args };
        const res = await fetch(`${BLOG_URL}/api/posts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return { content: [{ type: 'text', text: `Error: ${data.error}` }] };
        return {
          content: [
            {
              type: 'text',
              text: `Post created!\nID: ${data.id}\nStatus: ${data.status}\nURL: ${data.url}`,
            },
          ],
        };
      }

      case 'update_post': {
        const { id, ...updates } = args as { id: number; [key: string]: any };
        const res = await fetch(`${BLOG_URL}/api/posts/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (!res.ok) return { content: [{ type: 'text', text: `Error: ${data.error}` }] };
        return { content: [{ type: 'text', text: `Post ${id} updated. Fields: ${data.updated?.join(', ')}` }] };
      }

      case 'delete_post': {
        const { id } = args as { id: number };
        const res = await fetch(`${BLOG_URL}/api/posts/${id}`, {
          method: 'DELETE',
          headers,
        });
        const data = await res.json();
        if (!res.ok) return { content: [{ type: 'text', text: `Error: ${data.error}` }] };
        return { content: [{ type: 'text', text: `Post ${id} deleted.` }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Network error: ${err.message}` }] };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
