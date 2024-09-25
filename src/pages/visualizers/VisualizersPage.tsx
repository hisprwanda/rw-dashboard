import React from 'react';
import Button from "../../components/Button"
import { IoIosAddCircle } from 'react-icons/io';
import { IoSaveOutline } from 'react-icons/io5';


export default function Visualizers() {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex justify-between items-start">
                {/* Left Sidebar */}
                <div className="w-1/4 bg-white shadow-md p-4 rounded-lg">
                    <div className="flex justify-between mb-4">
                        <button className="text-lg font-semibold border-b-2 border-blue-500">
                            SELECT DATA
                        </button>
                      

                        <button className="text-lg font-semibold">
                            CUSTOMIZE
                        </button>
                    </div>
                    {/* Select Data Source Dropdown */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Data source</label>
                        <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option>Select data source</option>
                        </select>
                    </div>
                    {/* Indicators */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Indicators</label>
                
                        <Button variant="source" text="Add +"  />
                    </div>
                    {/* Organization Unit */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Unit</label>
                        <Button variant="source" text="Add +"  />
                    </div>
                    {/* Period */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                        <Button variant="source" text="Add +"  />
                    </div>
                </div>

                {/* Visualization Area */}
                <div className="flex-grow bg-white shadow-md p-4 rounded-lg mx-4">
                    <div className="flex justify-end mb-4">
                       
                        <Button variant="primary" text="Save"     type="button"
        icon={<IoSaveOutline />} />
                    </div>
                    <div className="h-[600px] flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100">
                        <p className="text-gray-500">[ Visualization Area ]</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
