import { createClient } from "@supabase/supabase-js";

// 只用 anon public key，安全暴露给前端（不可放 service_role / sb_secret_*）
// 在客户端组件里 import { supabase } from "@/lib/supabase" 使用
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
