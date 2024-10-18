import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateUid } from '../../../lib/uid';
import { VisualDataFormFields, VisualDataSchema } from '../../../types/visualType';
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';
import Button from '../../../components/Button';
import { IoSaveOutline } from 'react-icons/io5';
import { useAuthorities } from '../../../context/AuthContext';

interface SaveVisualTypeFormProps {
  setIsShowSaveVisualTypeForm: any;
}

const SaveVisualTypeForm: React.FC<SaveVisualTypeFormProps> = ({ setIsShowSaveVisualTypeForm }) => {
  const { analyticsQuery } = useAuthorities();
  const engine = useDataEngine();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VisualDataFormFields>({
    defaultValues: {
      id: generateUid(),
      visualType: "bar",  // Auto-generate visualType
      visualName: "",
      description: "",
      query: analyticsQuery,  // Automatically bind query from authorities
      dataSourceId: "JAEdLuvhqSU",  // Default value
      datasourceUrl: "https://example.com/data-source",  // Default value
      dataSourceName: "Rwanda Integrated Disease Surveillance",  // Default value
    },
    resolver: zodResolver(VisualDataSchema),
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<VisualDataFormFields> = async (formData) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const uid = generateUid(); // Generate unique ID

    try {
      // Submit the form data to the DHIS2 DataStore (path: rw-visuals)
      await engine.mutate({
        resource: `dataStore/rw-visuals/${uid}`,
        type: 'create',
        data: formData,
      });

      setSuccessMessage('Visual saved successfully!');
         // Delay a bit to show success message
         await new Promise((resolve) => setTimeout(() => resolve(), 2000));
         /// close modal
      setIsShowSaveVisualTypeForm(false)
      reset();  // Clear form after success
    } catch (error) {
      console.error('Error saving visual:', error);
      setErrorMessage('Failed to save visual. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md">
      <h1 className="text-2xl font-bold mb-4">Save Visual</h1>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Visual Name */}
        <div className="flex flex-col">
          <label className="text-gray-700">Visual Name</label>
          <input
            className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
            type="text"
            {...register('visualName', { required: 'Visual name is required' })}
          />
          {errors.visualName && <span className="text-red-500">{errors.visualName.message}</span>}
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="text-gray-700">Description</label>
          <input
            className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
            type="text"
            {...register('description')}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <Button
            variant="primary"
            text={isSubmitting ? 'Saving...' : 'Save'}
            type="submit"
            icon={<IoSaveOutline />}
          />
        </div>
      </form>
    </div>
  );
};

export default SaveVisualTypeForm;
