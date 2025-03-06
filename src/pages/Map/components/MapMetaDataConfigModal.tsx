import { useState } from "react";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

type MapMetaDataConfigModalProps = {
  themeLayerType: "Thematic Layer" | any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MapMetaDataConfigModal({ 
  themeLayerType, 
  isOpen, 
  onOpenChange 
}: MapMetaDataConfigModalProps) {
  const [activeTab, setActiveTab] = useState("data");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemType: "Indicator",
    indicatorGroup: "",
    aggregationType: "By data element",
    showCompletedEvents: false
  });
  
  const [hasError, setHasError] = useState(true);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error if indicator group has a value
    if (field === 'indicatorGroup' && value) {
      setHasError(false);
    } else if (field === 'indicatorGroup' && !value) {
      setHasError(true);
    }
  };

  const tabs = [
    { id: "data", label: "Data" },
    { id: "period", label: "Period" },
    { id: "orgUnits", label: "Org Units" },
    { id: "filter", label: "Filter" },
    { id: "style", label: "Style" }
  ];

  // Different content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case "data":
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemType">Item type</Label>
              <Select 
                value={formData.itemType} 
                onValueChange={(value) => handleInputChange('itemType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indicator">Indicator</SelectItem>
                  <SelectItem value="DataElement">Data Element</SelectItem>
                  <SelectItem value="DataSet">Data Set</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="indicatorGroup">Indicator group</Label>
              <Select 
                value={formData.indicatorGroup} 
                onValueChange={(value) => handleInputChange('indicatorGroup', value)}
              >
                <SelectTrigger className={`w-full ${hasError ? 'border-red-500 ring-red-500' : ''}`}>
                  <SelectValue placeholder="Select indicator group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group1">Group 1</SelectItem>
                  <SelectItem value="group2">Group 2</SelectItem>
                  <SelectItem value="group3">Group 3</SelectItem>
                </SelectContent>
              </Select>
              {hasError && <p className="text-red-500 text-sm">Unauthorized</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aggregationType">Aggregation type</Label>
              <Select 
                value={formData.aggregationType} 
                onValueChange={(value) => handleInputChange('aggregationType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select aggregation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="By data element">By data element</SelectItem>
                  <SelectItem value="By category">By category</SelectItem>
                  <SelectItem value="By period">By period</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showCompletedEvents" 
                checked={formData.showCompletedEvents}
                onCheckedChange={(checked) => handleInputChange('showCompletedEvents', checked)}
              />
              <Label htmlFor="showCompletedEvents">Only show completed events</Label>
            </div>
          </div>
        );
      case "period":
        return (
          <div className="py-4">
            <p className="text-gray-500">Period configuration options will appear here.</p>
          </div>
        );
      case "orgUnits":
        return (
          <div className="py-4">
            <p className="text-gray-500">Organization units configuration will appear here.</p>
          </div>
        );
      case "filter":
        return (
          <div className="py-4">
            <p className="text-gray-500">Filter configuration options will appear here.</p>
          </div>
        );
      case "style":
        return (
          <div className="py-4">
            <p className="text-gray-500">Style configuration options will appear here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-screen overflow-y-auto transition-all duration-300 ease-in-out bg-white"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Add new thematic layer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {/* Tab Navigation */}
          <div className="border-b flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-center ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          {getTabContent()}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="mt-4"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || hasError}
              className={`mt-4 ${hasError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Adding..." : "Add layer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}