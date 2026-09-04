import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_vsBNsY0zmLn8qKhvgaHrHQ_W0e9qtzm";

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseUrl.startsWith("http")) {
  try {
    client = createClient(supabaseUrl, supabaseKey);
    console.info("[Supabase] Connected to Project:", supabaseUrl);
  } catch (err) {
    console.warn("[Supabase] Init failed:", err);
  }
} else {
  console.info("[Supabase] Running in local offline mode (Awaiting VITE_SUPABASE_URL)");
}

export const supabase = client;
