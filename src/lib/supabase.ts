import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dogecuts.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZ2VjdXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4NzY0MDAsImV4cCI6MjAyNjQ1MjQwMH0.JWF5qHmrNPYxz3VRXWYGPJlvHDEVFxDlpQwZKh_Hy0Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storage: null,
  },
});
