import { Card } from "../../../../components/ui/card";
import { useState } from "react";

type BoxType = "Columns" | "Rows" | "Filter";

type DragDropState = {
  Columns: string[];
  Rows: string[];
  Filter: string[];
};

const initialState: DragDropState = {
  Columns: ["Data"],
  Rows: ["Period"],
  Filter: ["Organisation unit"],
};

const FilteringVisualsDragAndDrop = () => {
  const [payload, setPayload] = useState<DragDropState>(initialState);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [sourceBox, setSourceBox] = useState<BoxType | null>(null);

  const handleDrop = (box: BoxType) => {
    if (!draggingItem || !sourceBox || box === sourceBox) return;

    setPayload((prev) => {
      const newState = { ...prev };
      newState[sourceBox] = newState[sourceBox].filter((i) => i !== draggingItem);
      newState[box] = [...newState[box], draggingItem];
      return newState;
    });

    setDraggingItem(null);
    setSourceBox(null);
  };

  const renderBox = (title: BoxType) => (
    <div
      className="w-full md:w-1/3 p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(title)}
    >
      <h2 className="font-semibold mb-2">{title}</h2>
      <Card className="min-h-[100px] p-2 bg-gray-50 border">
        {payload[title].map((item) => (
          <div
            key={item}
            className="p-2 bg-white border rounded-md mb-2 shadow-sm cursor-move"
            draggable
            onDragStart={() => {
              setDraggingItem(item);
              setSourceBox(title);
            }}
          >
            {item}
          </div>
        ))}
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {renderBox("Columns")}
      {renderBox("Rows")}
      {renderBox("Filter")}
    </div>
  );
};

export default FilteringVisualsDragAndDrop;
