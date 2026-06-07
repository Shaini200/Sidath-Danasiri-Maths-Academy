export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const assetUrl = (path) => {
  if (!path) return '#';
  const normalizedPath = path.replace(/\\/g, '/');
  return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
};
