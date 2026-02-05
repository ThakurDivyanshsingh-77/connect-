// client/src/utils/config.ts

// Backend Base URL (ENV first, fallback hardcoded)
export const API_URL =
  import.meta.env.VITE_API_URL || "https://connect-315o.onrender.com";

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
