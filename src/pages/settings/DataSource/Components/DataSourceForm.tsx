import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateUid } from '../../../../lib/uid'
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';

// Schema definition using zod
const DataSourceSchema = z.object({
    id: z.string(),
    type: z.enum(['DHIS2', 'API']),
    authentication: z.object({
        url: z.string().url({ message: 'Must be a valid URL' }),
        username: z.string({ message: 'username is required' }),
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


type DataSourceFormProps = {
    title:string;
    action?:string;
    refetch?:any;
    data?:any
}

const DataSourceForm: React.FC<DataSourceFormProps> = ({title,action,refetch,data}) => {


    const savedDataSource = data?.value

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DataSourceFormFields>({
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

    const engine = useDataEngine(); 

    // Handle form submission
    const onSubmit: SubmitHandler<DataSourceFormFields> = async (data) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const uid = data.id || generateUid();
            await engine.mutate({
                resource: `dataStore/r-data-source/${uid}`,
                type: action,
                data: { ...data },
            });
            refetch()
            // Show success message and reset form
            setSuccessMessage('Data source saved successfully!');
            reset({
                id: generateUid(),
                type: 'DHIS2',
                isCurrentDHIS2: false,
                authentication: { url: '', username: '', password: '' },
                instanceName: '',
                description: '',
            });
        } catch (error) {
            console.error('Error saving data source:', error);
            setErrorMessage('Failed to save data source. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4  ">
                {/* Success and Error AlertBars */}
                {successMessage && (
                    <AlertBar duration={3000} onHidden={() => setSuccessMessage(null)} success>
                        {successMessage}
                    </AlertBar>
                )}
                {errorMessage && (
                    <AlertBar duration={4000} onHidden={() => setErrorMessage(null)} critical>
                        {errorMessage}
                    </AlertBar>
                )}

                {/* Data Source Type */}
                <div className="flex flex-col">
                    <label className="text-gray-700 ">Data Source Type</label>
                    <select
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        {...register('type')}
                    >
                        {dataSourceOptions.map(option => (
                            <option key={option.name} value={option.name}>{option.name}</option>
                        ))}
                    </select>
                    {errors.type && <span className="text-red-500">{errors.type.message}</span>}
                </div>

                {/* Instance Name */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Instance Name</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('instanceName', {
                            required: 'Instance name is required',
                            maxLength: { value: 50, message: 'Maximum length is 50 characters' }
                        })}
                    />
                    {errors.instanceName && <span className="text-red-500">{errors.instanceName.message}</span>}
                </div>

                {/* URL */}
                <div className="flex flex-col">
                    <label className="text-gray-700">URL</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('authentication.url', { required: 'URL is required' })}
                    />
                    {errors.authentication?.url && <span className="text-red-500">{errors.authentication.url.message}</span>}
                </div>

                {/* Username */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Username</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('authentication.username', { required: 'Username is required' })}
                    />
                    {errors.authentication?.username && <span className="text-red-500">{errors.authentication.username.message}</span>}
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Password</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="password"
                        {...register('authentication.password', { required: 'Password is required' })}
                    />
                    {errors.authentication?.password && <span className="text-red-500">{errors.authentication.password.message}</span>}
                </div>

                {/* Instance Description */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Instance Description</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('description')}
                    />
                </div>

                {/* Submit Button */}
             <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Loading..." : "Submit"}
                    </button>
                </div> 
            
            </form>
        </div>
    );
};

export default DataSourceForm;
