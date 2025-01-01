import { z } from 'zod';

// Schema definition using Zod
export const DataSourceSchema = z.object({
    instanceName: z.string().nonempty({ message: 'Instance name is required' }),
    description: z.string().optional(),
    url: z.string().url({ message: 'Must be a valid URL' }),
    token: z
        .string()
        .min(20, { message: 'Token must be at least 20 characters long' }) // Minimum length validation
        .max(256, { message: 'Token cannot exceed 256 characters' }) // Maximum length validation
        .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Token can only contain alphanumeric characters, dashes, or underscores' }), // Format validation
    type: z.enum(['DHIS2', 'API']),
    isCurrentInstance: z.boolean(),
});

// Infer form fields from the schema
export type DataSourceFormFields = z.infer<typeof DataSourceSchema>;



