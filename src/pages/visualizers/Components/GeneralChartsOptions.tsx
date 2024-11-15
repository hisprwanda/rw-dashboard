import { useAuthorities } from '../../../context/AuthContext';
import React, { useState } from 'react';
import Button from "../../../components/Button";

interface GeneralChartsStylesProps {
  setIsShowStyles: (value: any) => void;
  titleOption: 'none' | 'custom';
  setTitleOption: (value: any) => void;
  subtitleOption:'auto' | 'none' | 'custom';
  setSubtitleOption: (value: any) => void;
}

const GeneralChartsStyles: React.FC<GeneralChartsStylesProps> = ({ setIsShowStyles,setSubtitleOption,setTitleOption,subtitleOption,titleOption }) => {
  const { visualTitleAndSubTitle, setSelectedVisualTitleAndSubTitle ,fetchSingleOrgUnitName} = useAuthorities();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value as 'auto' | 'none' | 'custom';
    setTitleOption(selectedValue);

    setSelectedVisualTitleAndSubTitle((prev) => ({
      ...prev,
      visualTitle: selectedValue === 'custom' ? prev.visualTitle : '',
    }));
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value as 'auto' | 'none' | 'custom';
    setSubtitleOption(selectedValue);

    setSelectedVisualTitleAndSubTitle((prev) => ({
      ...prev,
      customSubTitle: selectedValue === 'custom' ? prev.customSubTitle : '',
    }));
  };

  const handleVisualTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVisualTitleAndSubTitle((prev) => ({
      ...prev,
      visualTitle: e.target.value,
    }));
  };

  const handleCustomSubTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVisualTitleAndSubTitle((prev) => ({
      ...prev,
      customSubTitle: e.target.value,
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <form>
        {/* Titles Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Titles</h3>

          {/* Chart title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chart title</label>
            <div className="space-y-2">
            
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="chartTitle"
                  value="none"
                  checked={titleOption === 'none'}
                  onChange={handleTitleChange}
                  className="text-primary"
                />
                <span>None</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="chartTitle"
                  value="custom"
                  checked={titleOption === 'custom'}
                  onChange={handleTitleChange}
                  className="text-primary"
                />
                <span>Custom</span>
              </label>
            </div>
            {titleOption === 'custom' && (
              <input
                type="text"
                placeholder="Enter chart title"
                value={visualTitleAndSubTitle.visualTitle}
                onChange={handleVisualTitleInputChange}
                className="mt-2 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            )}
          </div>

          {/* Chart subtitle */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chart subtitle</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="chartSubtitle"
                  value="auto"
                  checked={subtitleOption === 'auto'}
                  onChange={handleSubtitleChange}
                  className="text-primary"
                />
                <span>Auto generated</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="chartSubtitle"
                  value="none"
                  checked={subtitleOption === 'none'}
                  onChange={handleSubtitleChange}
                  className="text-primary"
                />
                <span>None</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="chartSubtitle"
                  value="custom"
                  checked={subtitleOption === 'custom'}
                  onChange={handleSubtitleChange}
                  className="text-primary"
                />
                <span>Custom</span>
              </label>
            </div>
            {subtitleOption === 'custom' && (
              <input
                type="text"
                placeholder="Enter subtitle"
                value={visualTitleAndSubTitle.customSubTitle}
                onChange={handleCustomSubTitleInputChange}
                className="mt-2 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            )}
          </div>
        </div>
        {/* close */}
        <div className=' flex justify-end ' >
        <Button text='Done' variant='primary' onClick={()=>setIsShowStyles(false)} />
        </div>
       
      </form>

    </div>
  );
};

export default GeneralChartsStyles;
