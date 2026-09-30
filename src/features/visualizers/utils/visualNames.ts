import type { SavedVisualEntry } from '../types/visual.types'

/** True when another visual (not `ownKey`) already uses this name (case-insensitive). */
export const isVisualNameTaken = (
    visuals: readonly SavedVisualEntry[] | undefined,
    name: string,
    ownKey?: string
): boolean => {
    const wanted = name.trim().toLowerCase()
    return (visuals ?? []).some(
        (entry) => entry.key !== ownKey && entry.value.visualName?.trim().toLowerCase() === wanted
    )
}
