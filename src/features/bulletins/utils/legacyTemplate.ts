import { generateUid } from '@/shared/utils/uid'
import type { BulletinSection, TextSection } from '../types/bulletin.types'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

const isRecord = (value: unknown): value is Record<string, Json> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

/** Every string of a JSON value, depth first (`{ title, content }` -> `title: content`). */
const strings = (value: Json | undefined): string[] => {
    if (value === undefined || value === null) return []
    if (typeof value === 'string') return value.trim() ? [value.trim()] : []
    if (typeof value === 'number' || typeof value === 'boolean') return []
    if (Array.isArray(value)) return value.flatMap(strings)
    if (typeof value.title === 'string' && typeof value.content === 'string') {
        return [`${value.title}: ${value.content}`]
    }
    return Object.values(value).flatMap(strings)
}

/**
 * Text sections from the old fixed-layout template (`page1`, `page2`… each with
 * `titles`/`main_titles`, `sub_titles` and `body_content`). Nothing is lost: the first
 * title names the section, every other text goes into its body.
 */
export const legacyTemplateToSections = (legacy: unknown, language: string): BulletinSection[] => {
    if (!isRecord(legacy)) return []
    return Object.values(legacy).flatMap((page): TextSection[] => {
        if (!isRecord(page)) return []
        const titleList = page.titles ?? page.main_titles
        const titles = strings(titleList)
        const rest = Object.entries(page)
            .filter(([key]) => key !== 'titles' && key !== 'main_titles')
            .flatMap(([, value]) => strings(value))
        const body = [...titles.slice(1), ...rest].join('\n\n')
        if (!titles[0] && !body) return []
        return [
            {
                id: generateUid(),
                type: 'text',
                title: { [language]: titles[0] ?? '' },
                body: { [language]: body },
            },
        ]
    })
}
