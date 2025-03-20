import Button from '../../../components/Button';
import React, { useEffect, useState } from 'react';
import { MapMetaDataConfigModal } from './MapMetaDataConfigModal';
import SelectOtherMapLayer from './SelectOtherMapLayer';
import { BasemapConfig, BasemapType, MapSidebarProps } from '../../../types/maps';
import { FaSave } from 'react-icons/fa';
import { SaveMapModal } from './SaveMapModal';
import { useAuthorities } from '.././../../context/AuthContext';







const MapSidebar: React.FC<MapSidebarProps> = ({ 
  basemaps, 
  currentBasemap, 
  onBasemapChange ,
  singleSavedMapData
}) => {
const {userDatails, selectedDataSourceOption, selectedOrgUnits, selectedLevel ,analyticsQuery,mapAnalyticsQueryTwo,geoFeaturesQuery} = useAuthorities()
  
const [showSaveMapModal, setShowSaveMapModal] = useState(false);
useEffect(()=>{
  console.log("test 2",{userDatails, selectedDataSourceOption, selectedOrgUnits, selectedLevel ,analyticsQuery,mapAnalyticsQueryTwo,geoFeaturesQuery})
},[userDatails, selectedDataSourceOption, selectedOrgUnits, selectedLevel ,analyticsQuery,mapAnalyticsQueryTwo,geoFeaturesQuery])
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-2">
       {/* sava map */}
       <div>
    <Button text="Save Changes" icon={<FaSave />} onClick={() => setShowSaveMapModal(true)} />
    <SaveMapModal open={showSaveMapModal} setOpen={setShowSaveMapModal} existingMapData={singleSavedMapData} />
  </div>
       {/* selecting other maps layer */}
      <SelectOtherMapLayer /> 
      {/* Basemap Selection */}
      <div className="space-y-1">
        <h3 className="text-xs text-gray-500 px-2 mb-1">Basemap</h3>
        {(Object.keys(basemaps) as BasemapType[]).map((basemap) => (
          <div 
            key={basemap}
            className={`
              flex items-center px-2 py-1 cursor-pointer 
              ${currentBasemap === basemap 
                ? 'bg-blue-100 border-l-2 border-blue-500' 
                : 'hover:bg-gray-100'}
            `}
            onClick={() => onBasemapChange(basemap)}
          >
            <img 
              className="h-6 w-6 mr-2 border border-gray-300" 
              src={basemaps[basemap].imgUrl} 
              alt={basemaps[basemap].name} 
            />
            <span className="text-sm">{basemaps[basemap].name}</span>
          </div>
        ))}
      </div>
     
    </div>
  );
};

export default MapSidebar;