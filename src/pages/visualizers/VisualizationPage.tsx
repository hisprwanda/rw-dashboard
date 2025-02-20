import React from 'react';
import VisualizerTable from './Components/VisualizerTable';
import { useFetchVisualsData } from '../../services/fetchVisuals';
import Button from "../../components/Button";
import { IoIosAddCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../../components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuthorities } from '../../context/AuthContext';
import OtherVisualizersTable from './Components/OtherVisualizersTable';
import { filterOtherCharts } from '../../lib/filterOtherDashboards';
import i18n from '../../locales/index.js'

function filterSavedChartsByCreatorId(data: any, creatorId: string) {
  return data?.filter(item => item.value.createdBy.id === creatorId);
}


const VisualizationPage = () => {
  const { data, loading, isError } = useFetchVisualsData();

  const { userDatails } = useAuthorities();




  console.log("data?.dataStore?.entries", data?.dataStore?.entries);
  console.log("userDatailsuserGroups", userDatails?.me?.userGroups);
  console.log("final", filterSavedChartsByCreatorId(data?.dataStore?.entries, userDatails?.me?.id));
  const navigate = useNavigate();

  //handle go to create visualizer page
  const handleGoToCreateVisualizerPage = () => {
    navigate('/visualizers');
  };


  // main return
  return (
    <div className='container w-full m-auto  p-2'  >
      {loading ? <Loading /> : <>


        <Tabs defaultValue="my-charts" className="w-full bg-white shadow-md rounded-lg p-4">
          <div className='flex justify-between' >
            <TabsList className="flex items-center justify-center gap-3 ">
              <TabsTrigger
                value="my-charts"
                className="text-[#2C6693] text-xl font-bold"
              >
                 {i18n.t('My Charts')}
              </TabsTrigger>
              <TabsTrigger
                value="Other-Charts"
                className="text-[#2C6693] text-xl font-bold"
              >
                   {i18n.t('Other Charts')}
              </TabsTrigger>
            </TabsList>
            <Button variant="primary" text={i18n.t('New Visualizer')} type="button" onClick={handleGoToCreateVisualizerPage}
              icon={<IoIosAddCircle />} />
          </div>

          <TabsContent value="my-charts" className="pt-4">
            <VisualizerTable savedVisualData={filterSavedChartsByCreatorId(data?.dataStore?.entries, userDatails?.me?.id)} />
          </TabsContent>
          <TabsContent value="Other-Charts" className="pt-4">
            <OtherVisualizersTable savedVisualData={filterOtherCharts(data?.dataStore?.entries, userDatails?.me?.id, userDatails?.me?.userGroups)} />


          </TabsContent>
        </Tabs>








      </>}

    </div>
  );
};

export default VisualizationPage;