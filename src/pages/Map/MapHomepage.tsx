
import React, { useEffect } from 'react'
import MapBody from './components/MapBody'
import DistrictMap from './components/DistrictMap'
import { useAuthorities } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { useFetchSingleMapData } from '../../services/fetchSingleStoredMap';
import { Loader } from '@mantine/core';


const MapHomepage: React.FC = () => {
  const {id:mapId} = useParams()
  const {geoFeaturesData, analyticsMapData, metaMapData,setIsUseCurrentUserOrgUnits,isSetPredifinedUserOrgUnits} = useAuthorities();
  const {data:singleSavedMapData,error,isError,loading} = useFetchSingleMapData(mapId)

  useEffect(()=>{
    console.log("heftching saved map data",singleSavedMapData)
  },[singleSavedMapData])


    // update if current user organization is selected
    useEffect(() => {
      if (singleSavedMapData) {
          const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(value => value === true);
          setIsUseCurrentUserOrgUnits(isAnyTrue);
      }

  }, [isSetPredifinedUserOrgUnits]);
  if(loading)
  {
    return <p>Loading</p>
  }

  /// main return
  return (
    <div className="">
      <MapBody analyticsMapData={analyticsMapData}  geoFeaturesData={geoFeaturesData}  metaMapData={metaMapData} singleSavedMapData={singleSavedMapData} mapId={mapId} />
    </div>
  )
}

export default MapHomepage