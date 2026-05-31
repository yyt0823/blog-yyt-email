import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { extractApiKey, validateApiKey } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [rows] = await pool.execute<any[]>(
    `SELECT p.*, u.name AS author_name
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.id = ? AND p.status = 'published'`,
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const apiKey = extractApiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await validateApiKey(apiKey);
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const [rows] = await pool.execute<any[]>('SELECT * FROM posts WHERE id = ?', [params.id]);
  const post = rows[0];
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.author_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updates: Record<string, any> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags);
  if (body.status !== undefined) {
    updates.status = body.status;
    if (body.status === 'published' && post.status !== 'published') {
      updates.published_at = new Date();
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  await pool.execute(
    `UPDATE posts SET ${setClauses} WHERE id = ?`,
    [...Object.values(updates), params.id]
  );

  return NextResponse.json({ id: Number(params.id), updated: Object.keys(updates) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const apiKey = extractApiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await validateApiKey(apiKey);
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const [rows] = await pool.execute<any[]>('SELECT * FROM posts WHERE id = ?', [params.id]);
  const post = rows[0];
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.author_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await pool.execute('DELETE FROM posts WHERE id = ?', [params.id]);
  return NextResponse.json({ deleted: true, id: Number(params.id) });
}
