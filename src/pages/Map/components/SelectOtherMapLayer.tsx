import React, { useEffect, useState } from "react";


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"


const SelectOtherMapLayer= () => {


  return (
    <ul className="space-y-2 p-0 list-none max-h-[600px] overflow-y-auto ">
    
  
      <Accordion type="single" collapsible className="w-full">
  
      <AccordionItem value="item-2">
        <AccordionTrigger> <li
      
        className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
      >
        Add Layers
      </li></AccordionTrigger>
        <AccordionContent>
        hello
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    </ul>
  );
};

export default SelectOtherMapLayer;
