import type { UserRef } from '@/shared/types/common.types'
import { generateUid } from '@/shared/utils/uid'
import { bulletinTemplateSchema } from '../schemas/bulletinTemplateSchema'
import type { BulletinTemplate } from '../types/bulletin.types'

/** Marks files written by this app (checked on import). */
export const TEMPLATE_FILE_FORMAT = 'dhis2-bulletin-template@1'

type PortableTemplate = Omit<
    BulletinTemplate,
    | 'id'
    | 'createdBy'
    | 'updatedBy'
    | 'createdAt'
    | 'updatedAt'
    | 'sharing'
    | 'generalDashboardAccess'
>

/** JSON of a template without ownership or sharing (to copy it to another instance). */
export const toTemplateFile = (template: BulletinTemplate): string => {
    const portable: PortableTemplate & { format: string } = {
        format: TEMPLATE_FILE_FORMAT,
        name: template.name,
        description: template.description,
        dataSourceId: template.dataSourceId,
        periodType: template.periodType,
        orgUnits: template.orgUnits,
        languages: template.languages,
        sections: template.sections,
    }
    return JSON.stringify(portable, null, 2)
}

export type TemplateFileResult =
    | { ok: true; template: BulletinTemplate }
    | { ok: false; error: 'invalid-json' | 'invalid-template'; details?: string }

/**
 * A new template (new id, owned by `author`) from an exported file. Section ids are
 * regenerated so a template can be imported twice.
 */
export const fromTemplateFile = (
    text: string,
    author: UserRef,
    now: number,
    knownDataSourceIds: readonly string[]
): TemplateFileResult => {
    let json: unknown
    try {
        json = JSON.parse(text)
    } catch {
        return { ok: false, error: 'invalid-json' }
    }
    const parsed = bulletinTemplateSchema.safeParse(json)
    if (!parsed.success) {
        return {
            ok: false,
            error: 'invalid-template',
            details: parsed.error.issues
                .slice(0, 3)
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('; '),
        }
    }
    const value = parsed.data
    return {
        ok: true,
        template: {
            ...value,
            id: generateUid(),
            // A data source of another instance does not exist here: fall back to this one.
            dataSourceId: knownDataSourceIds.includes(value.dataSourceId)
                ? value.dataSourceId
                : '1',
            sections: value.sections.map((section) => ({ ...section, id: generateUid() })),
            createdBy: author,
            updatedBy: author,
            createdAt: now,
            updatedAt: now,
        },
    }
}
