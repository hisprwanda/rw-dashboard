import React, { useEffect } from 'react'
import MapBody from './components/MapBody'
import DistrictMap from './components/DistrictMap'
import { useAuthorities } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { useFetchSingleMapData } from '../../services/fetchSingleStoredMap';
import { Loader } from '@mantine/core';
import { useRunGeoFeatures } from '../../services/maps';
import { formatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';
import { CircularLoader } from '@dhis2/ui'

const MapHomepage: React.FC = () => {
  const {id:mapId,mapName} = useParams()
  const {geoFeaturesData, analyticsMapData, metaMapData,setIsUseCurrentUserOrgUnits,isSetPredifinedUserOrgUnits,isFetchAnalyticsDataLoading,currentBasemap,legendType,mapSettings} = useAuthorities();
  const {data:singleSavedMapData,error,isError,loading,isFetchCurrentInstanceDataItemsLoading,isFetchExternalInstanceDataItemsLoading,isHandleDataSourceChangeLoading} = useFetchSingleMapData(mapId)
  const {loading:isFetchingGeoFeaturesLoading} = useRunGeoFeatures()
    // update if current user organization is selected
  //   useEffect(() => {
  //     console.log("isSetPredifinedUserOrgUnits in map ",isSetPredifinedUserOrgUnits )
  //     if (singleSavedMapData) {
  //         const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(value => value === true);
  //         setIsUseCurrentUserOrgUnits(isAnyTrue);
  //     }
  // }, [isSetPredifinedUserOrgUnits]);

  if(loading || isFetchAnalyticsDataLoading || isFetchingGeoFeaturesLoading)
  {
    return <div className='flex justify-center align-middle'  ><CircularLoader/></div>
  }

  /// main return
  return (
    <div className=" py-1 h-[calc(100vh-50px)] w-screen overflow-auto">
      <MapBody analyticsMapData={analyticsMapData}  geoFeaturesData={geoFeaturesData}  metaMapData={metaMapData} singleSavedMapData={singleSavedMapData} mapId={mapId} mapName={mapName} currentBasemap={currentBasemap} mapSettings={mapSettings} />
    </div>
  )
}

export default MapHomepage