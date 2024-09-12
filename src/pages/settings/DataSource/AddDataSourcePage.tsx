import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateUid } from '../../../lib/uid';
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';

// Schema definition using zod
const DataSourceSchema = z.object({
    id: z.string(),
    type: z.enum(['DHIS2', 'API']),
    authentication: z.object({
        url: z.string().url({ message: 'Must be a valid URL' }),
        username: z.string(),
        password: z.string(),
    }),
    isCurrentDHIS2: z.boolean(),
    instanceName: z.string(),
    description: z.string(),
});

// Infer form fields from the schema
type DataSourceFormFields = z.infer<typeof DataSourceSchema>;

const dataSourceOptions = [
    { name: 'DHIS2' },
    { name: 'API' }
];

const AddDataSourcePage = () => {
    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<DataSourceFormFields>({
        defaultValues: {
            isCurrentDHIS2: false,
            id: generateUid(),
            authentication: {
                url: '',
                username: '',
                password: '',
            },
            instanceName: '',
            description: '',
        },
        resolver: zodResolver(DataSourceSchema),
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const engine = useDataEngine(); // Access the data engine for manual API requests

    // Handle form submission
    const onSubmit: SubmitHandler<DataSourceFormFields> = async (data) => {
        // Clear previous success/error messages before new submission
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const uid = data.id || generateUid();

            // Use the dataEngine to send the data mutation request
            await engine.mutate({
                resource: `dataStore/r-data-source/${uid}`,
                type: 'create',
                data: {
                    ...data,
                },
            });

            // Show success message and reset form
            setSuccessMessage('Data source saved successfully!');
            reset({ // Reset form with a new ID and default values for other fields
                id: generateUid(),
                type: 'DHIS2',
                isCurrentDHIS2: false,
                authentication: {
                    url: '',
                    username: '',
                    password: '',
                },
                instanceName: '',
                description: '',
            });
        } catch (error) {
            console.error('Error saving data source:', error);
            setErrorMessage('Failed to save data source. Please try again.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-700">Add Data Source</h1>

            {/* Success and Error AlertBars */}
            {successMessage && (
                <AlertBar
                    duration={2000}
                    onHidden={() => setSuccessMessage(null)}
                    success
                    title="Success"
                >
                    {successMessage}
                </AlertBar>
            )}
            {errorMessage && (
                <AlertBar
                    duration={4000}
                    onHidden={() => setErrorMessage(null)}
                    critical
                    title="Error"
                >
                    {errorMessage}
                </AlertBar>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border-blue-800 max-w-[500px]">
                {/* Data Source Type */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1">Data Source Type</label>
                    <select
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        {...register('type')}
                    >
                        {dataSourceOptions.map((option) => (
                            <option key={option.name} value={option.name}>{option.name}</option>
                        ))}
                    </select>
                    {errors.type && <div className="text-red-700">{errors.type.message}</div>}
                </div>

                {/* Instance Name */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1">Instance Name</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        type="text"
                        {...register('instanceName', {
                            required: 'Instance name is required',
                            maxLength: { value: 50, message: 'Maximum length is 50 characters' }
                        })}
                    />
                    {errors.instanceName && <div className="text-red-700">{errors.instanceName.message}</div>}
                </div>

                {/* URL */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1">URL</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        type="text"
                        {...register('authentication.url', {
                            required: 'URL is required'
                        })}
                    />
                    {errors.authentication?.url && <div className="text-red-700">{errors.authentication.url.message}</div>}
                </div>

                {/* Username */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1">Username</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        type="text"
                        {...register('authentication.username', {
                            required: 'Username is required'
                        })}
                    />
                    {errors.authentication?.username && <div className="text-red-700">{errors.authentication.username.message}</div>}
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1">Password</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        type="password"
                        {...register('authentication.password', {
                            required: 'Password is required'
                        })}
                    />
                    {errors.authentication?.password && <div className="text-red-700">{errors.authentication.password.message}</div>}
                </div>

                {/* Instance Description */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1">Instance Description</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        type="text"
                        {...register('description')}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Loading..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDataSourcePage;
