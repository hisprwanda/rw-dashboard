import React, { useEffect } from "react";
import { useAuthorities } from "../../../context/AuthContext";
import { systemDefaultColorPalettes } from "../../../constants/colorPalettes";

interface VisualSettingsTypes {
  setIsShowStyles: (show: boolean) => void;
}

const VisualSettings: React.FC<VisualSettingsTypes> = ({ setIsShowStyles }) => {
  const {
    visualSettings,
    setSelectedVisualSettings,
    setSelectedColorPalette,
    selectedColorPalette,
  } = useAuthorities();

  const handlePaletteSelection = (paletteName: string) => {
    const selectedPalette = systemDefaultColorPalettes.find(
      (palette) => palette.name === paletteName
    );
    if (selectedPalette) {
      setSelectedColorPalette(selectedPalette);
    }
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
    <ul className="space-y-2 p-0 list-none">
      <li
        onClick={handleShowStyles}
        className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
      >
        Heading
      </li>

      <li>
        <div className="font-medium mb-2">Select a Color Palette</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {systemDefaultColorPalettes.map((palette) => (
            <div
              key={palette.name}
              onClick={() => handlePaletteSelection(palette.name)}
              className="p-4 border rounded-md shadow-sm cursor-pointer hover:shadow-md transition-all duration-200"
            >
              {/* Display the name */}
              <div className="font-semibold mb-2 text-center">{palette.name}</div>

              {/* Custom color preview */}
              <div
                className="h-12 rounded-md mb-2"
                style={{
                  background: `linear-gradient(to right, ${palette.itemsBackgroundColors
                    .slice(0, 5)
                    .join(",")})`,
                }}
              ></div>

              {/* Swatch preview for individual colors */}
              <div className="flex space-x-1 justify-center">
                {palette.itemsBackgroundColors.slice(0, 5).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border"
                    style={{
                      backgroundColor: color,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </li>
    </ul>
  );
};

export default VisualSettings;
