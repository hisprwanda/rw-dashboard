import React, { useState, useRef, useEffect } from 'react';
import { IoSaveOutline } from 'react-icons/io5';
import { TiExport } from "react-icons/ti";
import { ChevronDown } from 'lucide-react';

export const FileActionMenu = ({ visualId, handleExportVisualization, handleShowSaveVisualTypeForm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 border rounded-md bg-white hover:bg-gray-50"
      >
        File
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={() => {
                handleShowSaveVisualTypeForm();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <IoSaveOutline className="mr-2 h-4 w-4" />
              {visualId ? "Update" : "Save"}
            </button>
            
            <button
              onClick={() => {
                handleExportVisualization();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <TiExport className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

