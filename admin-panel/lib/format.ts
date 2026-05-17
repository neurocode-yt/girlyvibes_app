export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function maskToken(value: string | null | undefined) {
  if (!value) return "-";
  return value.length <= 8 ? `${value.slice(0, 2)}...` : `${value.slice(0, 8)}...`;
}

export function stringifyJson(value: unknown) {
  if (value === null || value === undefined) return "{}";
  return JSON.stringify(value, null, 2);
}
