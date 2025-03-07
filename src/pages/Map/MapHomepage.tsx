import React from 'react'
import MapBody from './components/MapBody'
import DistrictMap from './components/DistrictMap'

const MapHomepage: React.FC = () => {
  return (
    <div className="h-screen">
      <DistrictMap />
    </div>
  )
}

export default MapHomepage