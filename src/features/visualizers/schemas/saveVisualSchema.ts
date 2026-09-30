import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'

export const saveVisualSchema = z.object({
    visualName: z
        .string()
        .trim()
        .min(1, { message: i18n.t('Name is required') }),
    description: z.string(),
})

export type SaveVisualFormValues = z.infer<typeof saveVisualSchema>
