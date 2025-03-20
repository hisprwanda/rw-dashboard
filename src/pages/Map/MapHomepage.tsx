
import React, { useEffect } from 'react'
import MapBody from './components/MapBody'
import DistrictMap from './components/DistrictMap'
import { useAuthorities } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { useFetchSingleMapData } from '../../services/fetchSingleStoredMap';


const MapHomepage: React.FC = () => {
  const {id:mapId} = useParams()
  console.log("hello map id",mapId)
  const {data,error,isError,loading} = useFetchSingleMapData(mapId)
  useEffect(()=>{
    console.log("heftching saved map data",data)
  },[data])
  const {geoFeaturesData, analyticsMapData, metaMapData} = useAuthorities();
  return (
    <div className="">
      <MapBody analyticsMapData={analyticsMapData}  geoFeaturesData={geoFeaturesData}  metaMapData={metaMapData} />
    </div>
  )
}

export default MapHomepage