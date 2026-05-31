import pool from './db';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export function extractApiKey(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function validateApiKey(apiKey: string): Promise<AuthUser | null> {
  const [rows] = await pool.execute<any[]>(
    'SELECT id, name, email FROM users WHERE api_key = ?',
    [apiKey]
  );
  return rows[0] ?? null;
}
