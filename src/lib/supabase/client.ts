import { createClient } from '@supabase/supabase-js';

// .env.localからURLとキーを読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabaseクライアントを作成
// これが、私たちのアプリとSupabaseデータベースをつなぐ「橋」になります
export const supabase = createClient(supabaseUrl, supabaseAnonKey);