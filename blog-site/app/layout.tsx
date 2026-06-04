import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import 'highlight.js/styles/github-dark.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Campus App Dev Blog',
  description: 'Tech log for building the campus app — architecture, decisions, progress',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] font-inter antialiased">
        <header className="border-b border-[#1a1a1a] py-4">
          <div className="max-w-3xl mx-auto px-6 flex items-center gap-3">
            <a
              href="/"
              className="text-white font-semibold tracking-tight hover:text-blue-400 transition-colors"
            >
              campus.dev
            </a>
            <span className="text-[#444] select-none">/</span>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/" className="text-[#888] hover:text-blue-400 transition-colors">
                posts
              </a>
              <a href="/summaries" className="text-[#888] hover:text-blue-400 transition-colors">
                summaries
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>

        <footer className="border-t border-[#1a1a1a] py-6 mt-12">
          <div className="max-w-3xl mx-auto px-6 text-[#444] text-sm">
            campus app dev log · built with claude code
          </div>
        </footer>
      </body>
    </html>
  );
}
