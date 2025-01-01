import React from "react";
import { useAuthorities } from "../../../../context/AuthContext";

const AxisSettings = () => {
  const { visualSettings, setSelectedVisualSettings } = useAuthorities();

  // Handlers to update axis settings
  const handleXAxisChange = (field: "color" | "fontSize", value: string | number) => {
    const updatedSettings = {
      ...visualSettings,
      XAxisSettings: { 
        ...visualSettings.XAxisSettings, 
        [field]: value 
      },
    };
    setSelectedVisualSettings(updatedSettings);
  };

  const handleYAxisChange = (field: "color" | "fontSize", value: string | number) => {
    const updatedSettings = {
      ...visualSettings,
      YAxisSettings: { 
        ...visualSettings.YAxisSettings, 
        [field]: value 
      },
    };
    setSelectedVisualSettings(updatedSettings);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">

      {/* X Axis Settings */}
      <div className="mb-6">
        <h2 className="text-md font-semibold mb-2">X-Axis Settings</h2>
        <div className="flex items-center space-x-4">
          <label className="flex flex-col">
            <span className="text-sm font-medium">Color</span>
            <input
              type="color"
              value={visualSettings.XAxisSettings.color}
              onChange={(e) => handleXAxisChange("color", e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium">Font Size</span>
            <input
              type="number"
              value={visualSettings.XAxisSettings.fontSize}
              onChange={(e) => handleXAxisChange("fontSize", Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      {/* Y Axis Settings */}
      <div>
        <h2 className="text-md font-semibold mb-2">Y-Axis Settings</h2>
        <div className="flex items-center space-x-4">
          <label className="flex flex-col">
            <span className="text-sm font-medium">Color</span>
            <input
              type="color"
              value={visualSettings.YAxisSettings.color}
              onChange={(e) => handleYAxisChange("color", e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium">Font Size</span>
            <input
              type="number"
              value={visualSettings.YAxisSettings.fontSize}
              onChange={(e) => handleYAxisChange("fontSize", Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default AxisSettings;
