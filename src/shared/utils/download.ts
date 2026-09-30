/** Saves text as a file in the browser (JSON exports, CSV…). */
export const downloadText = (fileName: string, text: string, type = 'application/json') => {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
}

/** A file name from a free-text name (`Weekly eIDSR` -> `weekly_eidsr`). */
export const fileNameOf = (name: string, fallback = 'export') =>
    name
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '_')
        .toLowerCase() || fallback
