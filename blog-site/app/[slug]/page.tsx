import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { renderMarkdown } from '@/lib/markdown';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published_at: string;
  author_name: string;
}

async function getPost(slug: string): Promise<Post | null> {
  const [rows] = await pool.execute<any[]>(
    `SELECT p.*, u.name AS author_name
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.slug = ? AND p.status = 'published'`,
    [slug]
  );
  if (!rows[0]) return null;
  const post = rows[0];
  return { ...post, tags: Array.isArray(post.tags) ? post.tags : (post.tags ? JSON.parse(post.tags) : []) };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function readingTime(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return {};
  return { title: `${post.title} — Campus App Dev Blog` };
}

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const html = renderMarkdown(post.content);

  return (
    <article>
      <header className="mb-10">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-[#111] text-[#60a5fa] rounded border border-[#1e3a5f]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-3 text-[#555] text-sm">
          <span className="text-[#888]">{post.author_name}</span>
          <span>·</span>
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          <span>·</span>
          <span>{readingTime(post.content)} min read</span>
        </div>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <footer className="mt-12 pt-6 border-t border-[#1a1a1a]">
        <a href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          ← All posts
        </a>
      </footer>
    </article>
  );
}
