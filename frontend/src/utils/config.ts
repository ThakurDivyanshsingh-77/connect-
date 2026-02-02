// client/src/utils/config.ts
export const API_URL = "http://localhost:5000";

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("https")) return path;
  return `${API_URL}/${path.replace(/\\/g, "/")}`;
};