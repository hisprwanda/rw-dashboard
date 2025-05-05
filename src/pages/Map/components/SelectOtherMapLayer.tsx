import React, { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"
import { MapMetaDataConfigModal } from "./MapMetaDataConfigModal";
import { legendControllersKitTypes } from "../../../types/mapFormTypes";

const otherMapLayers = [
  {
    id: 1,
    name: "Thematic Layer",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    themeLayerType: "Thematic Layer",
  },
];


type SelectOtherMapLayerProps = {
  appliedLabels:string[];
   setAppliedLabels:any;
   selectedLabels:string[];
   setSelectedLabels:any;
   legendControllersKit:legendControllersKitTypes
}

const SelectOtherMapLayer:React.FC<SelectOtherMapLayerProps> = ({legendControllersKit,appliedLabels,setAppliedLabels,selectedLabels,setSelectedLabels}) => {
  // State to track which layer is selected
  const [selectedLayer, setSelectedLayer] = useState(null);
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Function to handle clicking on a layer
  const handleLayerClick = (layer) => {
    setSelectedLayer(layer);
    setIsModalOpen(true);
  };


  return (
    <ul className="space-y-2 p-0 list-none max-h-[600px] overflow-y-auto">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <li className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200">
              Add Layers
            </li>
          </AccordionTrigger>
          <AccordionContent>
            {otherMapLayers.map((layer) => (
              <div 
                key={layer.id} 
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200"
                onClick={() => handleLayerClick(layer)}
              >
                {layer.name}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Only render the modal if a layer is selected */}
      {selectedLayer && (
        <MapMetaDataConfigModal 
          themeLayerType={selectedLayer.themeLayerType}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          appliedLabels = {appliedLabels}
          setAppliedLabels = {setAppliedLabels}
          selectedLabels = {selectedLabels}
          setSelectedLabels ={setSelectedLabels}
          legendControllersKit={legendControllersKit}
        />
      )}
    </ul>
  );
};

export default SelectOtherMapLayer;