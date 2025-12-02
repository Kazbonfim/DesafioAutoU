import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function classifyEmail(content: string, filename?: string) {
  const apiUrl = `${supabaseUrl}/functions/v1/classify-email`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, filename }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to classify email');
  }

  return response.json();
}
