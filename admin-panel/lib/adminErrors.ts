export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown admin panel error.";
}

export function isMissingSupabaseConfig(error: unknown) {
  const message = getErrorMessage(error);
  return message.includes("NEXT_PUBLIC_SUPABASE_URL") || message.includes("SUPABASE_SERVICE_ROLE_KEY");
}
