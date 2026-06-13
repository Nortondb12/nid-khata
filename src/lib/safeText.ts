/**
 * Defense-in-depth string sanitizer for values coming from the NID API.
 * React already escapes content, but this strips control characters and
 * caps length so unexpected payloads can never blow up the layout.
 */
export const safeText = (value: unknown, maxLength = 500): string => {
  if (value == null) return "";
  const str = String(value).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
};
