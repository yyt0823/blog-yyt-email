import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { extractApiKey, validateApiKey } from '@/lib/auth';

function makeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80) +
    '-' +
    Date.now()
  );
}

function makeExcerpt(content: string): string {
  const plain = content.replace(/[#*`\[\]!>~_]/g, '').replace(/\n+/g, ' ').trim();
  return plain.length > 200 ? plain.slice(0, 200) + '…' : plain;
}

export async function GET() {
  const [rows] = await pool.execute<any[]>(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.tags, p.published_at, u.name AS author_name
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.status = 'published'
     ORDER BY p.published_at DESC`
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const apiKey = extractApiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await validateApiKey(apiKey);
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const body = await req.json();
  const { title, content, tags = [], status = 'published' } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
  }

  const slug = makeSlug(title);
  const excerpt = makeExcerpt(content);
  const publishedAt = status === 'published' ? new Date() : null;

  const [result] = await pool.execute<any>(
    `INSERT INTO posts (title, slug, content, excerpt, tags, author_id, status, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, content, excerpt, JSON.stringify(tags), user.id, status, publishedAt]
  );

  return NextResponse.json(
    {
      id: result.insertId,
      slug,
      status,
      url: `https://blog.yyt.email/${slug}`,
    },
    { status: 201 }
  );
}
