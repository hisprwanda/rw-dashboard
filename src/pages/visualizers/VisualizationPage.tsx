import React from 'react'
import VisualizerTable from './Components/VisualizerTable'
import { useFetchVisualsData } from '../../services/fetchVisuals'
import Button from "../../components/Button"
import { IoIosAddCircle } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../../components'


const VisualizationPage = () => {
  const {data,loading,isError}  = useFetchVisualsData()


  const navigate = useNavigate()

  //handle go to create visualizer page
  const handleGoToCreateVisualizerPage = () => {
    navigate('/visualizers')
  }


  // main return
  return (
    <div className='container w-full m-auto  p-2'  >
      {loading ? <Loading/> : <>
             {/* data source header */}
             <div className=" container flex justify-between py-5" >
        <h3 className="text-[#2C6693] text-xl font-bold " >My Charts</h3>

<Button variant="primary" text="Add Visualizer" type="button" onClick={handleGoToCreateVisualizerPage}
       icon={<IoIosAddCircle />} />


      </div>
      <VisualizerTable  savedVisualData={data?.dataStore?.entries} />
      </> }

      </div>
  )
}

export default VisualizationPage