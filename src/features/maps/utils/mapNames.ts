import type { SavedMapEntry } from '../types/map.types'

/** True when another map (not `ownKey`) already uses this name (case-insensitive). */
export const isMapNameTaken = (
    maps: readonly SavedMapEntry[] | undefined,
    name: string,
    ownKey?: string
): boolean => {
    const wanted = name.trim().toLowerCase()
    return (maps ?? []).some(
        (entry) => entry.key !== ownKey && entry.value.mapName?.trim().toLowerCase() === wanted
    )
}
