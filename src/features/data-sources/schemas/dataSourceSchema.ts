import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'

export const dataSourceSchema = z.object({
    instanceName: z
        .string()
        .trim()
        .min(1, { message: i18n.t('Instance name is required') }),
    description: z.string().optional(),
    url: z.string().url({ message: i18n.t('Must be a valid URL') }),
    token: z
        .string()
        .min(20, { message: i18n.t('Token must be at least 20 characters long') })
        .max(256, { message: i18n.t('Token cannot exceed 256 characters') })
        .regex(/^[a-zA-Z0-9_-]+$/, {
            message: i18n.t('Token can only contain letters, numbers, dashes or underscores'),
        }),
    type: z.enum(['DHIS2', 'API']),
    isCurrentInstance: z.boolean(),
})

export type DataSourceFormValues = z.infer<typeof dataSourceSchema>
