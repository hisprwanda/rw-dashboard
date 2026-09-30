import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { CHART_TYPES } from '@/features/charts'

const localizedText = z.record(z.string(), z.string())
const ref = z.object({ id: z.string().min(1), name: z.string() })
const base = {
    id: z.string().min(1),
    title: localizedText,
    description: localizedText.optional(),
}

export const bulletinSectionSchema = z.discriminatedUnion('type', [
    z.object({
        ...base,
        type: z.literal('cover'),
        logos: z.array(z.string().startsWith('data:image/')),
        subtitle: localizedText,
    }),
    z.object({ ...base, type: z.literal('text'), body: localizedText }),
    z.object({
        ...base,
        type: z.literal('indicatorTrends'),
        dataItems: z.array(z.object({ id: z.string().min(1), label: z.string() })),
        lookback: z.number().int().min(0).max(104),
        chartType: z.enum(CHART_TYPES),
    }),
    z.object({
        ...base,
        type: z.literal('trackerCases'),
        program: ref.nullable(),
        groupBy: ref.nullable(),
        rules: z.array(
            z.object({
                match: z.string().min(1),
                category: z.enum(['case', 'death', 'publicEvent']),
            })
        ),
    }),
    z.object({
        ...base,
        type: z.literal('eventSignals'),
        program: ref.nullable(),
        codeElement: ref.nullable(),
        locationElement: ref.nullable(),
        countElement: ref.nullable(),
    }),
    z.object({
        ...base,
        type: z.literal('completeness'),
        dataSets: z.array(ref),
        orgUnitLevel: z.number().int().min(1),
        lookback: z.number().int().min(0).max(104),
        thresholds: z.object({ good: z.number().min(0), fair: z.number().min(0) }),
    }),
    z.object({
        ...base,
        type: z.literal('outbreaks'),
        columns: z.array(z.object({ id: z.string().min(1), label: localizedText })),
    }),
    z.object({ ...base, type: z.literal('notes') }),
])

/** What a template must look like (used to validate imported JSON files). */
export const bulletinTemplateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: i18n.t('Name is required') }),
    description: z.string().default(''),
    dataSourceId: z.string().min(1),
    periodType: z.string().min(1),
    orgUnits: z.object({
        useCurrentUserOrgUnits: z.boolean(),
        userOrgUnitScope: z.object({
            is_USER_ORGUNIT: z.boolean(),
            is_USER_ORGUNIT_CHILDREN: z.boolean(),
            is_USER_ORGUNIT_GRANDCHILDREN: z.boolean(),
        }),
        orgUnitIds: z.array(z.string()),
        treePaths: z.array(z.string()),
        levelIds: z.array(z.string()),
        levels: z.array(z.number()),
        groupIds: z.array(z.string()),
    }),
    languages: z.array(z.string().min(2)).min(1),
    sections: z.array(bulletinSectionSchema),
})

export type BulletinTemplateInput = z.infer<typeof bulletinTemplateSchema>
