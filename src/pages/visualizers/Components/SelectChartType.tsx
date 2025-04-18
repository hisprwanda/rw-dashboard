import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Search } from 'lucide-react';

const SelectChartType = ({ chartComponents, selectedChartType, setSelectedChartType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  // Filter chart components based on the search term
  const filteredCharts = chartComponents.filter(chart => 
    chart.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the currently selected chart to display on the trigger button
  const selectedChart = chartComponents.find(chart => chart.type === selectedChartType);

  const handleSelectChart = (chartType) => {
    setSelectedChartType(chartType);
    setOpen(false);
  };

  return (
   
          <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild    >
        <button className="flex items-center align-middle gap-2 p-1 border rounded-md bg-white hover:bg-gray-50">
          {selectedChart && (
            <>
              <span>{selectedChart.type}</span>
              <span className="h-5 w-5">{selectedChart.icon}</span>
            </>
          )}
          {!selectedChart && "Select Chart Type"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select Chart Type</DialogTitle>
          <DialogDescription>
            Choose the visualization that best fits your data.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full mb-4">
          <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search visual..."
            className="w-full pl-8 p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
          {filteredCharts.map(chart => (
            <div 
              key={chart.type} 
              className={`flex flex-col p-4 border rounded-md cursor-pointer transition-colors ${
                selectedChartType === chart.type ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'
              }`} 
              onClick={() => handleSelectChart(chart.type)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6">{chart.icon}</div>
                <h3 className="font-medium">{chart.type}</h3>
              </div>
              {chart.description && (
                <p className="text-sm text-gray-500">{chart.description}</p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  
  
  );
};

export default SelectChartType;