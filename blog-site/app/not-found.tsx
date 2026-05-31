export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-[#444] text-6xl font-bold mb-4">404</p>
      <p className="text-[#666] mb-8">Post not found.</p>
      <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
        ← Back to all posts
      </a>
    </div>
  );
}
