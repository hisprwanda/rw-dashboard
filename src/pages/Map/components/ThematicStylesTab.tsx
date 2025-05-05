import React, { useState, useEffect } from 'react';
import { LabelControls } from '../MapLabels';

type ThematicStylesTabProps = {
    appliedLabels: string[];
    setAppliedLabels: React.Dispatch<React.SetStateAction<string[]>>;
    selectedLabels: string[];
    setSelectedLabels: any;
}

const ThematicStylesTab: React.FC<ThematicStylesTabProps> = ({appliedLabels, setAppliedLabels, selectedLabels, setSelectedLabels }) => {
  // Label controls state
  const [showLabelControls, setShowLabelControls] = useState<boolean>(true);
  const [labelOptions] = useState([
    { id: 'area', label: 'Area Name' },
    { id: 'data', label: 'Data Name' },
    { id: 'period', label: 'Period' },
    { id: 'value', label: 'Value' }
  ]);

  // UseEffect to apply labels whenever selectedLabels changes
  useEffect(() => {
    // Only apply if the labels panel is showing and selectedLabels has been initialized
    if (showLabelControls && selectedLabels) {
      setAppliedLabels([...selectedLabels]);
    }
  }, [selectedLabels, showLabelControls, setAppliedLabels]);
  
  // We'll keep this function for any direct calls that might be needed
  const handleApplyLabels = () => {
    setAppliedLabels([...selectedLabels]);
  };
  
  return (
    <div className="p-4">

      {/* Label Controls Section */}
      <div className="mb-6">
        <button 
          type="button" {/* Add this line to prevent form submission */}
          onClick={(e) => {
            e.stopPropagation();
            setShowLabelControls(!showLabelControls);
          }}
          className="bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100"
        >
          {showLabelControls ? ' Label Options' : 'Show Labels'}
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
        
 
      </div>
    </div>
  );
};

export default ThematicStylesTab;