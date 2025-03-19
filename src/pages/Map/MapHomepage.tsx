
import React from 'react'
import MapBody from './components/MapBody'
import DistrictMap from './components/DistrictMap'
import { useAuthorities } from '../../context/AuthContext';

const MapHomepage: React.FC = () => {
  const {geoFeaturesData, analyticsMapData, metaMapData} = useAuthorities();
  return (
    <div className="h-screen">
      <MapBody/>
 
  
    </div>
  )
}

export default MapHomepage