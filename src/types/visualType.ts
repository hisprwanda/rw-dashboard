import { z } from 'zod';

// Schema definition using zod
export const VisualDataSchema = z.object({
    id: z.string(),
    visualType: z.enum(['bar', 'pie', 'line']),
    visualName: z.string().nonempty({ message: 'Visual name is required' }),
    description: z.string(),
    query: z.record(z.string(), z.any()).refine(
        (data) => Object.keys(data).length > 0, 
        { message: 'Query object cannot be empty' }
    ), // Added custom refinement for non-empty check
    dataSourceId: z.string().nonempty({ message: 'Data source ID is required' }),
    datasourceUrl: z.string().nonempty({ message: 'Data source URL is required' }),
    dataSourceName: z.string().nonempty({ message: 'Data source name is required' }),
    // createdBy: z.string().optional(),
    // createdAt: z.string().optional(),
    // updatedAt: z.string().optional(),
    // updatedBy: z.string().optional()
});

// Infer form fields from the schema
export type VisualDataFormFields = z.infer<typeof VisualDataSchema>;
