import React, { useState, useEffect } from 'react';
import { LabelControls } from '../MapLabels';

type ThematicStylesTabProps = {
    appliedLabels: string[];
    setAppliedLabels: React.Dispatch<React.SetStateAction<string[]>>;
    selectedLabels:string[];
     setSelectedLabels:any
  }

const ThematicStylesTab: React.FC<ThematicStylesTabProps> = ({appliedLabels,setAppliedLabels,selectedLabels,setSelectedLabels }) => {
  // Label controls state
  const [showLabelControls, setShowLabelControls] = useState<boolean>(false);
  //const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelOptions] = useState([
    { id: 'area', label: 'Area Name' },
    { id: 'data', label: 'Data Name' },
    { id: 'period', label: 'Period' },
    { id: 'value', label: 'Value' }
  ]);

  // Apply selected labels
  const handleApplyLabels = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAppliedLabels([...selectedLabels]);
    setShowLabelControls(false);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Thematic Styles</h2>
      
      {/* Label Controls Section */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Map Labels</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            setShowLabelControls(!showLabelControls)
          }}
          className="bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100"
        >
          {showLabelControls ? 'Hide Label Options' : 'Show Labels'}
        </button>
        
        {/* Label Control Panel */}
        {showLabelControls && (
          <LabelControls 
            labelOptions={labelOptions}
            selectedLabels={selectedLabels}
            onChange={setSelectedLabels}
            onApply={handleApplyLabels}
            onClose={() => setShowLabelControls(false)}
          />
        )}
        
        {appliedLabels.length > 0 && (
          <div className="mt-2 text-sm">
            <p>Applied labels: {appliedLabels.map(label => {
              const option = labelOptions.find(opt => opt.id === label);
              return option ? option.label : label;
            }).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThematicStylesTab;