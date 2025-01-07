import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateUid } from '../../../../lib/uid';
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';
import Button from "../../../../components/Button";
import { DataSourceFormFields, DataSourceSchema } from '../../../../types/DataSource';
import { IoSaveOutline } from "react-icons/io5";
import { useToast } from "../../../../components/ui/use-toast";

const dataSourceOptions = [
    { name: 'DHIS2', value: 'DHIS2' },
    // { name: 'API', value: 'API' },
];

type DataSourceFormProps = {
    title: string;
    action?: 'create' | 'update';
    refetch?: () => void;
    data?: { key: string; value: DataSourceFormFields };
    setIsShowDataSourceForm?: React.Dispatch<React.SetStateAction<boolean>>;
    setIsShowDataSourceFormEdit?: React.Dispatch<React.SetStateAction<boolean>>;
};

const DataSourceForm: React.FC<DataSourceFormProps> = ({
    title,
    action,
    refetch,
    data,
    setIsShowDataSourceForm,
    setIsShowDataSourceFormEdit,
}) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DataSourceFormFields>({
        defaultValues: {
            id: generateUid(),
            instanceName: '',
            description: '',
            url: '',
            token: '',
            type: 'DHIS2',
            isCurrentInstance: false,
            
        },
        resolver: zodResolver(DataSourceSchema),
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const { toast } = useToast();
    const engine = useDataEngine();

    // Populate form fields when updating
    useEffect(() => {
        if (action === 'update' && data?.value) {
            reset(data.value);
        }
    }, [action, data, reset]);

    const onSubmit: SubmitHandler<DataSourceFormFields> = async (formData) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const uid = action === 'update' && data ? data.key : generateUid();
            await engine.mutate({
                resource: `dataStore/${process.env.REACT_APP_DATA_SOURCES_STORE}/${uid}`,
                type: action === 'update' ? 'update' : 'create',
                data: formData,
            });
            toast({
                title: "Success",
                description: "saved successfully",
                variant: "default",
              });

            refetch && refetch();
           // setSuccessMessage('Data source saved successfully!');

            // Hide form after success
            if (action === 'update') {
                setIsShowDataSourceFormEdit?.(false);
            } else {
                setIsShowDataSourceForm?.(false);
                reset({
                    id: generateUid(),
                    instanceName: '',
                    description: '',
                    url: '',
                    token: '',
                    type: 'DHIS2',
                    isCurrentInstance: false,
                });
            }
        } catch (error) {
            console.error('Error saving data source:', error);
            //setErrorMessage('Failed to save data source. Please try again.');
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
              });
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Success and Error Messages */}
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

                {/* Instance Name */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Instance Name</label>
                    <input
                        type="text"
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        {...register('instanceName')}
                    />
                    {errors.instanceName && (
                        <span className="text-red-500">{errors.instanceName.message}</span>
                    )}
                </div>

                {/* URL */}
                <div className="flex flex-col">
                    <label className="text-gray-700">URL</label>
                    <input
                        type="url"
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        {...register('url')}
                    />
                    {errors.url && (
                        <span className="text-red-500">{errors.url.message}</span>
                    )}
                </div>

            {/* Token */}
      <div className="flex flex-col">
    <label className="text-gray-700">Token</label>
    <input
        type="text"
        className={`p-2 border rounded-md focus:ring ${
            errors.token ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
        {...register('token')}
    />
    {/* Display error message */}
    {errors.token && (
        <span className="text-red-500 text-sm mt-1">{errors.token.message}</span>
    )}
          </div>


                {/* Data Source Type */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Data Source Type</label>
                    <select
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        {...register('type')}
                    >
                        {dataSourceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {errors.type && (
                        <span className="text-red-500">{errors.type.message}</span>
                    )}
                </div>

                {/* Is Current Instance */}
                {/* <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="mr-2"
                        {...register('isCurrentInstance')}
                    />
                    <label className="text-gray-700">Is Current Instance</label>
                </div> */}

                {/* Description */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Description</label>
                    <textarea
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        {...register('description')}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-4">
                    <Button
                        variant="primary"
                        text={isSubmitting ? 'Loading...' : action === 'update' ? 'Update' : 'Save'}
                        type="submit"
                        icon={<IoSaveOutline />}
                    />
                </div>
            </form>
        </div>
    );
};

export default DataSourceForm;
