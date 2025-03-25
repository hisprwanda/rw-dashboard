import React from 'react';
import { Legend, LegendClass } from '../../../types/maps';

type MapLegendProps = {
  legendType: string;
  autoLegend: LegendClass[];
  selectedLegendSet: Legend;
};

const MapLegend: React.FC<MapLegendProps> = ({ 
  legendType, 
  autoLegend, 
  selectedLegendSet 
}) => {
  // Get active legend classes
  const legendClasses = legendType === "auto" ? autoLegend : selectedLegendSet.legends;
  
  return (
    <div className="absolute bottom-20 right-10 bg-white p-4 rounded-md shadow-lg z-50">
      <div className="mb-2 font-bold">
        {legendType === "auto" ? "Automatic Legend" : selectedLegendSet.name}
      </div>
      {legendClasses.map((item, index) => (
        <div 
          key={index} 
          className="flex items-center mb-1"
        >
          <div 
            className="w-5 h-5 mr-2 border border-gray-300"
            style={{ backgroundColor: item.color }}
          ></div>
          <span>
            {item.name}: {item.startValue.toFixed(1)} - {item.endValue.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MapLegend;