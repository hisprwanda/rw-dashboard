import Button from '../../../components/Button';
import React from 'react';
import { MapMetaDataConfigModal } from './MapMetaDataConfigModal';
import SelectOtherMapLayer from './SelectOtherMapLayer';

// Basemap Type
type BasemapType = 'osm-light' | 'osm-detailed';

// Basemap Configuration Type
type BasemapConfig = {
  imgUrl: string;
  url: string;
  name: string;
  attribution: string;
};

// MapSidebar Props Type
type MapSidebarProps = {
  basemaps: Record<BasemapType, BasemapConfig>;
  currentBasemap: BasemapType;
  onBasemapChange: (basemap: BasemapType) => void;
};

const MapSidebar: React.FC<MapSidebarProps> = ({ 
  basemaps, 
  currentBasemap, 
  onBasemapChange 
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-2">
      <button className="text-sm font-bold mb-2 px-2">+ Add layer</button>  
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
      {/* <MapMetaDataConfigModal/> */}
    </div>
  );
};

export default MapSidebar;