import React, { useEffect } from 'react';
import MyMapsTable from "./components/MyMapsTable"
import OtherMapsTable from './components/OtherMapsTable';
import { useFetchAllSavedMaps } from '../../services/maps';
import Button from "../../components/Button";
import { IoIosAddCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../../components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuthorities } from '../../context/AuthContext';
import { filterOtherCharts } from '../../lib/filterOtherDashboards';
import i18n from '../../locales/index.js'

function filterSavedChartsByCreatorId(data: any, creatorId: string) {
  return data?.filter(item => item.value.createdBy.id === creatorId);
}


const AllMapsPage = () => {
  const { data, loading, isError } = useFetchAllSavedMaps();

  const { userDatails } = useAuthorities();

useEffect(()=>{
    console.log("hello saved map data",data)
})


  console.log("data?.dataStore?.entries", data?.dataStore?.entries);
  console.log("userDatailsuserGroups", userDatails?.me?.userGroups);
  console.log("final", filterSavedChartsByCreatorId(data?.dataStore?.entries, userDatails?.me?.id));
  const navigate = useNavigate();

  //handle go to create visualizer page
  const handleGoToCreateMap = () => {
    navigate('/map');
  };


  // main return
  return (
    <div className='container w-full m-auto  p-2'  >
      {loading ? <Loading /> : <>
        <Tabs defaultValue="my-maps" className="w-full bg-white shadow-md rounded-lg p-4">
          <div className='flex justify-between' >
            <TabsList className="flex items-center justify-center gap-3 ">
              <TabsTrigger
                value="my-maps"
                className="text-[#2C6693] text-xl font-bold"
              >
                 {i18n.t('My Maps')}
              </TabsTrigger>
              <TabsTrigger
                value="Other-Maps"
                className="text-[#2C6693] text-xl font-bold"
              >
                   {i18n.t('Other Charts')}
              </TabsTrigger>
            </TabsList>
            <Button variant="primary" text={i18n.t('New Map')} type="button" onClick={handleGoToCreateMap}
              icon={<IoIosAddCircle />} />
          </div>

          <TabsContent value="my-maps" className="pt-4">
            <MyMapsTable savedVisualData={filterSavedChartsByCreatorId(data?.dataStore?.entries, userDatails?.me?.id)} />
          </TabsContent>
          <TabsContent value="Other-Maps" className="pt-4">
              <OtherMapsTable savedVisualData={filterOtherCharts(data?.dataStore?.entries, userDatails?.me?.id, userDatails?.me?.userGroups)} />  
          </TabsContent>
        </Tabs>








      </>}

    </div>
  );
};

export default AllMapsPage;