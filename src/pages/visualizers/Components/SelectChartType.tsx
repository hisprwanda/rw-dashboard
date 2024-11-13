import React, { useState } from 'react';

const SelectChartType = ({ chartComponents, selectedChartType, setSelectedChartType }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter chart components based on the search term
    const filteredCharts = chartComponents.filter(chart => 
        chart.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        // make it fill it's containers
        <div className='max-w-[600px] overflow-auto ' >
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search charts..."
                className="block w-full p-1 border rounded-md mb-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* make it fill it's containers */}
            <div className="  overflow-x-auto">
                <div className="flex gap-2">
                    {filteredCharts.map(chart => (
                        <div 
                            key={chart.type} 
                            className={`flex items-center p-2 border rounded-md cursor-pointer ${selectedChartType === chart.type ? 'bg-blue-100' : 'bg-white'}`} 
                            onClick={() => setSelectedChartType(chart.type)}
                        >
                            <div className=" h-4 flex gap-1 items-center justify-center">
                                {chart.icon} {chart.type}
                            </div>
                        
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectChartType;
