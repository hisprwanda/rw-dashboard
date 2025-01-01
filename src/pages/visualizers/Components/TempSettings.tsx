import React from 'react'
import { useAuthorities } from '../../../context/AuthContext';


interface VisualSettingsTypes {
    setIsShowStyles: any;
}

const VisualSettings:React.FC<VisualSettingsTypes> = ({setIsShowStyles}) => {
    const {visualSettings,setSelectedVisualSettings,} = useAuthorities();


    const handleShowStyles = ()=>{
        setIsShowStyles(true)
      }

      const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = event.target.value;
        setSelectedVisualSettings((prevSettings) => ({
            ...prevSettings,
            backgroundColor: newColor, 
        }));
    };


// main return
  return (
    <ul className="space-y-2 p-0 list-none">
  
      
    <li onClick={handleShowStyles} className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200">
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


</ul>

  )
}

export default VisualSettings