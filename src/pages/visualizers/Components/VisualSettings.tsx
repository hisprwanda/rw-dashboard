import React, { useEffect, useState } from "react";
import { useAuthorities } from "../../../context/AuthContext";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"
import AxisSettings from "./Settings/AxisSettings";
import ColorPaletteSettings from "./Settings/ColorPaletteSettings";

interface VisualSettingsTypes {
  setIsShowStyles: (show: boolean) => void;
}

const VisualSettings: React.FC<VisualSettingsTypes> = ({ setIsShowStyles }) => {
  const { 
    visualSettings,
    setSelectedVisualSettings,
    selectedColorPalette
  } = useAuthorities();
  



  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setSelectedVisualSettings((prevSettings) => ({
        ...prevSettings,
        backgroundColor: newColor, 
    }));
};
  const handleFillColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setSelectedVisualSettings((prevSettings) => ({
        ...prevSettings,
        fillColor: newColor, 
    }));
};



  const handleShowStyles = () => {
    setIsShowStyles(true);
  };

  useEffect(() => {
    setSelectedVisualSettings((prevSettings) => ({
      ...prevSettings,
      visualColorPalette: selectedColorPalette,
    }));
    console.log("selectedColorPalette changed", selectedColorPalette);
  }, [selectedColorPalette]);

  return (
    <ul className="space-y-2 p-0 list-none max-h-[600px] overflow-y-auto ">
      <li
        onClick={handleShowStyles}
        className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
      >
        Heading
      </li>
      <li className="flex items-center justify-between px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-200">
<span className="font-medium">Background</span>
<input
                type="color"
                value={visualSettings.backgroundColor}
                onChange={handleColorChange}
                className="w-8 h-8 p-1 border rounded-md cursor-pointer border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            />
</li>
      <li className="flex items-center justify-between px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-200">
<span className="font-medium">Fill Color</span>
<input
                type="color"
                value={visualSettings.fillColor}
                onChange={handleFillColorChange}
                className="w-8 h-8 p-1 border rounded-md cursor-pointer border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            />
</li>
      <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger> <li
      
        className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
      >
        Color Palettes
      </li></AccordionTrigger>
        <AccordionContent>
      <ColorPaletteSettings/>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger> <li
      
        className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
      >
        Axis
      </li></AccordionTrigger>
        <AccordionContent>
        <AxisSettings/>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    </ul>
  );
};

export default VisualSettings;
