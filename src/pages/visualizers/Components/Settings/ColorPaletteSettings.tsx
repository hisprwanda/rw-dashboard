import React, { useState } from 'react'
import { systemDefaultColorPalettes } from "../../../../constants/colorPalettes";
import { useAuthorities } from "../../../../context/AuthContext";
const ColorPaletteSettings = () => {

    const { 
        setSelectedColorPalette,
        selectedColorPalette,
      } = useAuthorities();
  // State to store the search term
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Filtered palettes based on search term
  const filteredPalettes = systemDefaultColorPalettes.filter((palette) =>
    palette.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    const handlePaletteSelection = (paletteName: string) => {
        const selectedPalette = systemDefaultColorPalettes.find(
          (palette) => palette.name === paletteName
        );
        if (selectedPalette) {
          setSelectedColorPalette(selectedPalette);
        }
      };

  return (
    <div>
    <li>
     <div className="mb-4">
       <input
         type="text"
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         placeholder="Search for a color palette..."
         className="w-full p-2 border border-gray-300 rounded-md"
       />
     </div>
   </li>
   {/* Display selected color palette */}
   <li>
     <div className="font-medium mb-2">Currently Selected Palette</div>
     {selectedColorPalette ? (
       <div
         className="p-4 border rounded-md shadow-sm"
         style={{
           background: `linear-gradient(to right, ${selectedColorPalette.itemsBackgroundColors
             .slice(0, 5)
             .join(",")})`,
         }}
       >
         <div className="font-semibold mb-2 text-center">{selectedColorPalette.name}</div>
         <div className="flex space-x-1 justify-center">
           {selectedColorPalette.itemsBackgroundColors.slice(0, 5).map((color, index) => (
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
     ) : (
       <div className="text-gray-500 text-center">No palette selected</div>
     )}
   </li> 
   {/* Select a Color Palette */}
   <li>
     <div className="font-medium mb-2">Select a Color Palette</div>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-x-auto">
       {filteredPalettes.map((palette) => (
         <div
           key={palette.name}
           onClick={() => handlePaletteSelection(palette.name)}
           className="p-4 border rounded-md shadow-sm cursor-pointer hover:shadow-md transition-all duration-200"
         >
           <div className="font-semibold mb-2 text-center">{palette.name}</div>
           <div
             className="h-12 rounded-md mb-2"
             style={{
               background: `linear-gradient(to right, ${palette.itemsBackgroundColors
                 .slice(0, 5)
                 .join(",")})`,
             }}
           ></div>
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
    </div>
  )
}

export default ColorPaletteSettings