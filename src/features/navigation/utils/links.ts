/** Joins the instance base URL with a path returned by the server. Absolute URLs pass through. */
export const joinUrl = (baseUrl: string, path: string): string => {
    if (/^https?:\/\//.test(path)) return path
    return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^(\.\.\/)+|^\/+/, '')}`
}

/** Up to two initials of a name: "John Traore" -> "JT". */
export const initialsOf = (name: string | undefined): string =>
    (name ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')

/** Apps whose name contains the search text (case-insensitive). */
export const filterApps = <T extends { name: string; displayName?: string }>(
    apps: readonly T[],
    search: string
): T[] => {
    const wanted = search.trim().toLowerCase()
    return wanted
        ? apps.filter((app) => (app.displayName ?? app.name).toLowerCase().includes(wanted))
        : [...apps]
}
