import React, { useState } from 'react';

const SelectChartType = ({ chartComponents, selectedChartType, setSelectedChartType }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter chart components based on the search term
    const filteredCharts = chartComponents.filter(chart => 
        chart.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search charts..."
                className="block w-full p-2 border rounded-md mb-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Container with fixed height and scrolling behavior */}
            <div className="max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                    {filteredCharts.map(chart => (
                        <div 
                            key={chart.type} 
                            className={`flex items-center p-4 border rounded-md cursor-pointer ${selectedChartType === chart.type ? 'bg-blue-100' : 'bg-white'}`} 
                            onClick={() => setSelectedChartType(chart.type)}
                        >
                            <div className="mr-3 w-8 h-8 flex items-center justify-center">
                                {chart.icon} {/* Chart icon goes here */}
                            </div>
                            <div>
                                <h4 className="font-bold">{chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart</h4>
                                <p className="text-sm text-gray-600">{chart.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectChartType;
