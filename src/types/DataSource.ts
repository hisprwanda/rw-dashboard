import { DataSourceType } from '@/pages/settings/components/add-form';
import { z } from 'zod';

// Schema definition using zod
export const DataSourceSchema = z.object({
    id: z.string(),
    type: z.enum(['DHIS2', 'API']),
    authentication: z.object({
        url: z.string().url({ message: 'Must be a valid URL' }),
        username: z.string().nonempty({ message: 'Username is required' }),
        password: z.string().nonempty({ message: 'Password is required' }),
    }),
    isCurrentDHIS2: z.boolean(),
    instanceName: z.string().nonempty({ message: 'Instance name is required' }),
    description: z.string(),
});

// Infer form fields from the schema
export type DataSourceFormFields = z.infer<typeof DataSourceSchema>;


export interface DataSourceResponse {
    key:   string;
    value: Value;
}

export interface Value {
    id:             string;
    type:           DataSourceType;
    description:    string;
    instanceName:   string;
    authentication: Authentication;
    isCurrentDHIS2: boolean;
}

export interface Authentication {
    url:      string;
    password: string;
    username: string;
}
