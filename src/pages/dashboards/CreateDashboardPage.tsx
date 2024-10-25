import React, { useEffect, useState } from 'react';
import Button from "../../components/Button"
import { useFetchVisualsData } from '../../services/fetchVisuals';
import { useAuthorities } from '../../context/AuthContext';
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";


const CreateDashboardPage = () => {

    const {data:allSavedVisuals,loading,isError}  = useFetchVisualsData()

    const [selectedVisualsForDashboard, setSelectedVisualsForDashboard] = useState<any>([]);

    const [selectedVisual, setSelectedVisual] = useState('');

    const visualOptions = allSavedVisuals?.dataStore?.entries?.map((entry:any) =>{
        return <option key={entry.key} value={entry.key}>{entry?.value?.visualName}</option>
    } )

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVisual(e.target.value);
        // update selectedVisual
      //  setSelectedVisualsForDashboard()
      };


      // test
      useEffect(()=>{
        console.log("selectedVisualsForDashboard hanged",selectedVisualsForDashboard)
      },[selectedVisualsForDashboard])

    /// main return
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-end ">
        <div className='flex items-center gap-2'  >
        <Button  text='Save changes' />
        <Button  text='Print preview' />
        </div> 
      </div>

      {/* selecting visuals */}
      <select   value={selectedVisual} onChange={handleChange}
         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mt-3  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    {visualOptions}
                                </select>

        {/* dashboard  section */}
     

    </div>
  );
};

export default CreateDashboardPage;
