import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function isPlaceholder(value: string) {
  return /your-|choose-|server-only/i.test(value);
}

function normalizeSupabaseUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl.trim());
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Supabase URL must start with http:// or https://.");
    }

    return url.origin;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid URL.";
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL for admin panel: ${message}`);
  }
}

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || isPlaceholder(supabaseUrl)) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for admin panel.");
  }

  if (!serviceRoleKey || isPlaceholder(serviceRoleKey)) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin panel server runtime.");
  }

  if (!adminClient) {
    adminClient = createClient(normalizeSupabaseUrl(supabaseUrl), serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}
