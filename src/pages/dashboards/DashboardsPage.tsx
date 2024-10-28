import React from 'react'
import VisualizerTable from '../visualizers/Components/VisualizerTable'
import { useFetchVisualsData } from '../../services/fetchVisuals'
import { useDashboardsData } from '../../services/fetchDashboard'
import Button from "../../components/Button"
import { IoIosAddCircle } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../../components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuthorities } from '../../context/AuthContext';
import DashboardsTables from './components/DashboardsTables'

function filterSavedChartsByCreatorId(data:any, creatorId:string) {
  return data?.filter(item => item.value.createdBy.id === creatorId);
}
function filterOtherCharts(data:any, creatorId:string) {
  return data?.filter(item => item.value.createdBy.id !== creatorId);
}

const DashboardsPage = () => {
 // const {data,loading,isError}  = useFetchVisualsData()
  const {data,loading,isError}   = useDashboardsData()

  console.log("dashboardData jk",data)
 
  const {userDatails} = useAuthorities();


  

 console.log("data?.dataStore?.entries",data?.dataStore?.entries)
  console.log("userDatails?.me?.id",userDatails?.me?.id)
  console.log("final",filterSavedChartsByCreatorId(data?.dataStore?.entries,userDatails?.me?.id))
  const navigate = useNavigate()

  //handle go to create visualizer page
  const handleGoToCreateVisualizerPage = () => {
    navigate('/dashboard')
  }


  // main return
  return (
    <div className='container w-full m-auto  p-2'  >
      {loading ? <Loading/> : <>
          

        <Tabs defaultValue="my-charts" className="w-full bg-white shadow-md rounded-lg p-4">
        <div className='flex justify-between' >
        <TabsList className="flex items-center justify-center gap-3 ">
                        <TabsTrigger
                            value="my-charts"
                            className="text-[#2C6693] text-xl font-bold"
                        >
                            My Dashboard
                        </TabsTrigger>
                        <TabsTrigger
                            value="Other-Charts"
                            className="text-[#2C6693] text-xl font-bold"
                        >
                            Other Dashboard
                        </TabsTrigger>
                    </TabsList>
        <Button variant="primary" text="New Dashboard" type="button" onClick={handleGoToCreateVisualizerPage}
       icon={<IoIosAddCircle />} />
        </div>
                
                    <TabsContent value="my-charts" className="pt-4">
                      <DashboardsTables savedDashboardData={filterSavedChartsByCreatorId(data?.dataStore?.entries,userDatails?.me?.id)}/>
                    {/* <VisualizerTable  savedVisualData={filterSavedChartsByCreatorId(data?.dataStore?.entries,userDatails?.me?.id)} /> */}
                    </TabsContent>
                    <TabsContent value="Other-Charts" className="pt-4">

                    <DashboardsTables savedDashboardData={filterOtherCharts(data?.dataStore?.entries,userDatails?.me?.id)}/>
                   
              
                    </TabsContent>
                </Tabs>







  
      </> }

      </div>
  )
}

export default DashboardsPage