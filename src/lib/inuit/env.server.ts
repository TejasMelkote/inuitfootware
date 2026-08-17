export function hasSupabaseConfig() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
  return Boolean(url && key);
}

export function canPersistConversations() {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}
