import Link from 'next/link';
import pool from '@/lib/db';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published_at: string;
  author_name: string;
}

async function getSummaries(): Promise<Post[]> {
  const [rows] = await pool.execute<any[]>(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.tags, p.published_at, u.name AS author_name
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.status = 'published'
       AND JSON_CONTAINS(p.tags, '"summary"')
     ORDER BY p.published_at DESC`
  );
  return rows.map(r => ({ ...r, tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []) }));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const metadata = { title: 'Session Summaries — Campus App Dev Blog' };

export const dynamic = 'force-dynamic';

export default async function SummariesPage() {
  const posts = await getSummaries();

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Session Summaries</h1>
        <p className="text-[#666] text-lg leading-relaxed">
          Detailed, learning-oriented logs of each working session — what was done,
          the decisions made and why, problems hit, and what shipped.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-[#444] italic">
          No summaries yet. Publish one via Claude Code with the <code>/summary</code> command.
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <article
              key={post.id}
              className="border border-[#1a1a1a] rounded-xl p-6 hover:border-[#2a2a2a] transition-colors group"
            >
              <div className="flex items-center gap-2 text-[#555] text-sm mb-3">
                <span className="text-[#777]">{post.author_name}</span>
                <span>·</span>
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </div>

              <Link href={`/${post.slug}`}>
                <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
              </Link>

              <p className="text-[#777] leading-relaxed mb-4 text-sm">{post.excerpt}</p>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
