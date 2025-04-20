import { useEffect, useState } from "react";
import { IoIosTime } from "react-icons/io";
import { RiOrganizationChart } from "react-icons/ri";
import { AiOutlineDatabase } from "react-icons/ai";
import { AnalyticsFilteringBoxTypes,analyticsPayloadDeterminerTypes } from "../../../../types/analyticsTypes";
import { useAuthorities } from "../../../../context/AuthContext";





const FilteringVisualsDragAndDrop = () => {
  const {analyticsPayloadDeterminer,setAnalyticsPayloadDeterminer} = useAuthorities()
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [sourceBox, setSourceBox] = useState<AnalyticsFilteringBoxTypes | null>(null);

  useEffect(() => {
    console.log("analyticsPayloadDeterminer changed x", analyticsPayloadDeterminer);
  }, [analyticsPayloadDeterminer]);

  const handleDrop = (box: AnalyticsFilteringBoxTypes) => {
    if (!draggingItem || !sourceBox || box === sourceBox) return;

    setAnalyticsPayloadDeterminer((prev) => {
      const newState = { ...prev };
      newState[sourceBox] = newState[sourceBox].filter((i) => i !== draggingItem);
      newState[box] = [...newState[box], draggingItem];
      return newState;
    });

    setDraggingItem(null);
    setSourceBox(null);
  };

  const renderBox = (title: AnalyticsFilteringBoxTypes, isRight = false) => (
    <div
      className={`${isRight ? "ml-auto" : ""} min-w-[200px]`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(title)}
    >
  <div className="grid grid-cols-[60px_1fr] gap-2 items-start">
  {/* first column is exactly 150px */}
  <div className="text-sm font-medium text-gray-600">
    {title}
  </div>

  {/* second column takes up the remaining space */}
  <div className="w-full bg-white border border-gray-300 rounded-md min-h-[20px] p-1">
    {analyticsPayloadDeterminer[title].map((item) => (
      <div
        key={item}
        className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-800  rounded-md text-sm shadow-sm mt-1 mr-1 cursor-move"
        draggable
        onDragStart={() => {
          setDraggingItem(item);
          setSourceBox(title);
        }}
      >
        <span className="text-base">
          {{
            Data: <AiOutlineDatabase />,
            "Organisation unit": <RiOrganizationChart />,
            Period: <IoIosTime />,
          }[item]}
        </span>
        <span>{item}</span>
       
      </div>
    ))}
  </div>
</div>

  
    </div>
  );

  return (
    <div className="flex">
      <div className="flex flex-col border-r border-gray-200 w-1/2">
        {renderBox("Columns")}
        {renderBox("Rows")}
      </div>
      <div className="pl-1 w-1/2">
        {renderBox("Filter", true)}
      </div>
    </div>
  );
};

export default FilteringVisualsDragAndDrop;