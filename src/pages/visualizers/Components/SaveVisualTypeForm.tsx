import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateUid } from '../../../lib/uid';
import { VisualDataFormFields, VisualDataSchema } from '../../../types/visualType';
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';
import Button from '../../../components/Button';
import { IoSaveOutline } from 'react-icons/io5';
import { useAuthorities } from '../../../context/AuthContext';
import { useFetchVisualsData } from '../../../services/fetchVisuals';
import { useNavigate } from 'react-router-dom';

interface SaveVisualTypeFormProps {
  setIsShowSaveVisualTypeForm: any;
  selectedDataSourceId:string,
  visualId?:string,
  singleSavedVisualData:any
}

const SaveVisualTypeForm: React.FC<SaveVisualTypeFormProps> = ({visualId,singleSavedVisualData,setIsShowSaveVisualTypeForm ,selectedDataSourceId}) => {
  const { analyticsQuery,userDatails,selectedChartType,selectedOrgUnits,selectedLevel, visualTitleAndSubTitle } = useAuthorities();
  const {data:allSavedVisuals,loading,isError}  = useFetchVisualsData()
  const navigate = useNavigate();


  const engine = useDataEngine();



  const { register, handleSubmit,watch, reset, formState: { errors, isSubmitting } } = useForm<VisualDataFormFields>({
    defaultValues: {
      id:  generateUid(),
      visualType: selectedChartType,
      visualTitleAndSubTitle:visualTitleAndSubTitle,  
      visualName:   "",
      description:   "",
    
      query: analyticsQuery,
      
      dataSourceId: selectedDataSourceId, 
      createdBy:{
        name:userDatails?.me?.displayName,
        id:userDatails?.me?.id
      },
      updatedBy:{
        name:userDatails?.me?.displayName,
        id:userDatails?.me?.id
      },
      createdAt: Date.now(), 
      updatedAt: Date.now(), 
      organizationTree:selectedOrgUnits,
      selectedOrgUnitLevel:selectedLevel
  
    },
    resolver: zodResolver(VisualDataSchema),
  });

     // Watch form values
  const watchedValues = watch();

  // Log form data when it changes
  useEffect(() => {
    console.log('Form data changed:', watchedValues);
  }, [watchedValues]);
  // reset saved values
  useEffect(() => {
    if (visualId && singleSavedVisualData) {
        reset((prevValues) => ({
            ...prevValues, // Spread the existing values to retain them
            id: singleSavedVisualData?.dataStore?.id,
            visualName: singleSavedVisualData?.dataStore?.visualName || prevValues.visualName,
            visualTitleAndSubTitle: singleSavedVisualData?.dataStore?.visualTitleAndSubTitle || prevValues.visualTitleAndSubTitle,
            description: singleSavedVisualData?.dataStore?.description || prevValues.description,
            createdBy: singleSavedVisualData?.dataStore?.createdBy || prevValues.createdBy,
            createdAt: singleSavedVisualData?.dataStore?.createdAt || prevValues.createdAt,
        }));
    }
}, [singleSavedVisualData, visualId, reset]);

   

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<VisualDataFormFields> = async (formData) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    // Check for duplicate visualName and query
    const existingVisual = allSavedVisuals?.dataStore?.entries?.some((entry: any) =>
        entry.value.visualName === formData.visualName 
    );

    // Show error if a duplicate is found
    if(!visualId)
    {
      if (existingVisual) {
        setErrorMessage('The visual name already exists. Please use different value.');
        return;
    }
    }
 

    const uid = visualId || generateUid(); 

    try {
        // Submit the form data to the DHIS2 DataStore (path: rw-visuals)
        await engine.mutate({
            resource: `dataStore/rw-visuals/${uid}`,
            type:visualId ? "update" : 'create',
            data: formData,
        });

        setSuccessMessage('Visual saved successfully!');
        // Delay a bit to show success message
        await new Promise((resolve) => setTimeout(() => resolve(), 2000));
        // Close modal
        setIsShowSaveVisualTypeForm(false);
        // go in edit mode after saving first visual
        if(!visualId){
          // added navigate(`/visualization`) intentionally to fix length undefined bug
                 navigate(`/visualization`)
                navigate(`/visualizers/${uid}`)    
               }
    
    } catch (error) {
        console.error('Error saving visual:', error);
        setErrorMessage('Failed to save visual. Please try again.');
    }
};


  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md">
      <h1 className="text-2xl font-bold mb-4">Save visualization as</h1>

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
          <label className="text-gray-700">Name</label>
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
          <textarea
  className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
  {...register('description')}
/>

        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <Button
            variant="primary"
            disabled={isSubmitting}
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
