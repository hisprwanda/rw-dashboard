import React, { useState } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';
import Button from "../../../components/Button" 
import { MdDelete } from "react-icons/md";
import i18n from '../../../locales/index.js'

type DeleteProps = {
    id: string;
    refetch: any;
    setIsShowDeleteVisualType:any
};

const DeleteVisualTypeCard: React.FC<DeleteProps> = ({ id, refetch,setIsShowDeleteVisualType }) => {

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const [isLoading,setIsLoading] = useState(false)
    const [isSuccess,setIsSuccess] = useState(false)
    const engine = useDataEngine();
    const deleteVisual = async () => {
        try {
            setIsLoading(true);
          const resp =  await engine.mutate({
                resource: `dataStore/${process.env.REACT_APP_VISUALS_STORE}/${id}`,
                type: "delete",
            });
            if(resp?.httpStatus)
            {
                setIsSuccess(true)
            }
          
            setIsLoading(false);
            setSuccessMessage('Visual deleted successfully!');
            // show success message
            await new Promise((resolve:any) => setTimeout(() => {
                console.log("");  // Your code here
                resolve();
            }, 2000));
            
            refetch();
            setIsShowDeleteVisualType(false)
         
        
        } catch (error) {
         setIsSuccess(false)
        }
        finally{
            setIsLoading(false)
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
            {/* Success message */}
            {successMessage && (
                <AlertBar
                    duration={3000}
                    onHidden={() => setSuccessMessage(null)}
                    success
                >
                    {successMessage}
                </AlertBar>
            )}

{!isSuccess && <>
    <h2 className="text-xl font-semibold mb-4 text-gray-800">
    `${i18n.t('Are you sure you want to delete this visual?')}`   
            </h2>
            <div className="flex justify-end space-x-4 ">
            
      <Button variant="danger" text={isLoading ? `${i18n.t('Please wait...')}` : `${i18n.t('Confirm')}`  }     type="button"
      onClick={deleteVisual}  icon={<MdDelete />} />

            </div>
</>}
          
        </div>
    );
};

export default DeleteVisualTypeCard;
