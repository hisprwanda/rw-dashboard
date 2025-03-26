import React, { useState } from 'react';
import { Legend, LegendClass } from '../../../types/maps';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

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
  // State to control legend visibility
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  
  // Get active legend classes
  const legendClasses = legendType === "auto" ? autoLegend : selectedLegendSet.legends;

  return (
    <div 
      className={`absolute bottom-4 right-4 z-[1000] w-64 bg-white rounded-md shadow-lg transition-all duration-300 ease-in-out ${
        isHidden ? 'opacity-0 translate-y-full' : 'opacity-100'
      }`}
    >
      {/* Legend Header with Toggle */}
      <div 
        className="flex justify-between items-center p-3 cursor-pointer border-b bg-gray-100 rounded-t-md"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="font-bold flex-grow">
          {legendType === "auto" ? "Automatic Legend" : selectedLegendSet.name}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Close Button */}
          {/* <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsHidden(true);
            }} 
            className="hover:bg-gray-200 rounded-full p-1"
          >
            <X size={20} />
          </button> */}
          
          {/* Minimize/Maximize Toggle */}
          {isMinimized ? <ChevronUp />: <ChevronDown /> }
        </div>
      </div>
      
      {/* Legend Content */}
      {!isMinimized && !isHidden && (
        <div className="p-3 max-h-[300px] overflow-y-auto">
          {legendClasses.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center mb-2"
            >
              <div 
                className="w-5 h-5 mr-3 border border-gray-300"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">
                {item.name}: {item.startValue.toFixed(1)} - {item.endValue.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reopen Button when hidden */}
      {isHidden && (
        <button 
          onClick={() => setIsHidden(false)}
          className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 z-[1000]"
        >
          <ChevronUp />
        </button>
      )}
    </div>
  );
};

export default MapLegend;