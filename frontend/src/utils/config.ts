// client/src/utils/config.ts

// Backend Base URL (ENV first, localhost fallback for local development)
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper to resolve image/file URLs
export const getImageUrl = (path?: string | null) => {
  if (!path) return undefined;

  // Already absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Normalize slashes (Windows → URL safe)
  const cleanPath = path.replace(/\\/g, "/");

  return `${API_URL}/${cleanPath}`;
};
