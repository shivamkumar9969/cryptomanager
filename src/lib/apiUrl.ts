const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";

export function getApiUrl(path: string) {
    return `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
}
