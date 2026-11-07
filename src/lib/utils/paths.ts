export const BASE_PATH = "/deccan-table-demo";
// Next Link/router add basePath themselves; public image URLs need it explicitly.
export function assetPath(source: string): string {
  if (
    !source.startsWith("/") ||
    source.startsWith("//") ||
    source === BASE_PATH ||
    source.startsWith(BASE_PATH + "/")
  )
    return source;
  return BASE_PATH + source;
}
export function orderHref(id: string, play = false): string {
  return (play ? "/order/play/" : "/order/") + "?id=" + encodeURIComponent(id);
}
export function normalizedPath(path: string): string {
  const withoutBase =
    path === BASE_PATH
      ? "/"
      : path.startsWith(BASE_PATH + "/")
        ? path.slice(BASE_PATH.length)
        : path;
  return withoutBase.replace(/\/+$/, "") || "/";
}
