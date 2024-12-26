import React, { useEffect, useState } from 'react';

// ... (keep the existing constants: groupedPeriods, fixedPeriodTypes)

const TabButton = ({ selected, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-medium rounded-t-lg ${
            selected 
                ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);

const TransferList = ({ availableOptions, selectedOptions, onSelect, onDeselect }) => {
    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Available Periods</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onSelect(option)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Selected Periods</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onDeselect(option)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex justify-between items-center"
                        >
                            <span>{option.label}</span>
                            <span className="text-red-500">×</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PeriodPicker = ({ onUpdate }) => {
    const [selectedTab, setSelectedTab] = useState('relative');
    const [selectedPeriodGroup, setSelectedPeriodGroup] = useState('days');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedPeriodType, setSelectedPeriodType] = useState('monthly');
    const [availablePeriods, setAvailablePeriods] = useState([]);
    const [selectedPeriods, setSelectedPeriods] = useState([]);
    const [allPeriodOptions, setAllPeriodOptions] = useState(new Map());
    const [analyticsDimensions, setAnalyticsDimensions] = useState({ dx: [], pe: [] });

    // ... (keep generateFixedPeriods function as is)

    const filterRelativePeriods = (group) => {
        const periods = groupedPeriods[group] || [];
        return periods.map(period => ({ 
            label: period.replace(/_/g, ' '), 
            value: period,
            type: 'relative'
        }));
    };

    const updateAvailablePeriods = () => {
        let newPeriods;
        if (selectedTab === 'relative') {
            newPeriods = filterRelativePeriods(selectedPeriodGroup);
        } else {
            newPeriods = generateFixedPeriods(selectedYear, selectedPeriodType);
        }
        
        const newOptionsMap = new Map(allPeriodOptions);
        newPeriods.forEach(period => {
            newOptionsMap.set(period.value, period);
        });
        setAllPeriodOptions(newOptionsMap);

        setAvailablePeriods(
            newPeriods.filter(period => !selectedPeriods.includes(period.value))
        );
    };

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        updateAvailablePeriods();
    };

    const handlePeriodSelect = (period) => {
        const newSelectedPeriods = [...selectedPeriods, period.value];
        setSelectedPeriods(newSelectedPeriods);
        setAnalyticsDimensions(prev => ({
            ...prev,
            pe: newSelectedPeriods
        }));
        setAvailablePeriods(prev => prev.filter(p => p.value !== period.value));
    };

    const handlePeriodDeselect = (period) => {
        const newSelectedPeriods = selectedPeriods.filter(value => value !== period.value);
        setSelectedPeriods(newSelectedPeriods);
        setAnalyticsDimensions(prev => ({
            ...prev,
            pe: newSelectedPeriods
        }));
        
        if (
            (selectedTab === 'relative' && period.type === 'relative') ||
            (selectedTab === 'fixed' && period.type !== 'relative')
        ) {
            setAvailablePeriods(prev => [...prev, period]);
        }
    };

    const handleUpdate = () => {
        onUpdate?.(selectedPeriods, analyticsDimensions);
    };

    useEffect(() => {
        updateAvailablePeriods();
    }, [selectedTab, selectedPeriodGroup, selectedYear, selectedPeriodType]);

    const selectedPeriodObjects = selectedPeriods.map(periodValue => {
        const periodObject = allPeriodOptions.get(periodValue);
        return periodObject || { value: periodValue, label: periodValue };
    });

    return (
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow">
            <div className="flex gap-2 mb-6 border-b">
                <TabButton 
                    selected={selectedTab === 'relative'} 
                    onClick={() => handleTabChange('relative')}
                >
                    Relative periods
                </TabButton>
                <TabButton 
                    selected={selectedTab === 'fixed'} 
                    onClick={() => handleTabChange('fixed')}
                >
                    Fixed periods
                </TabButton>
            </div>

            {selectedTab === 'relative' && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period group
                    </label>
                    <select
                        value={selectedPeriodGroup}
                        onChange={(e) => {
                            setSelectedPeriodGroup(e.target.value);
                            updateAvailablePeriods();
                        }}
                        className="w-full p-2 border rounded-md bg-white"
                    >
                        {Object.keys(groupedPeriods).map((group) => (
                            <option key={group} value={group}>
                                {group.charAt(0).toUpperCase() + group.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedTab === 'fixed' && (
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Period Type
                        </label>
                        <select
                            value={selectedPeriodType}
                            onChange={(e) => {
                                setSelectedPeriodType(e.target.value);
                                updateAvailablePeriods();
                            }}
                            className="w-full p-2 border rounded-md bg-white"
                        >
                            {fixedPeriodTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                        </label>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(parseInt(e.target.value, 10));
                                updateAvailablePeriods();
                            }}
                            className="w-full p-2 border rounded-md bg-white"
                        />
                    </div>
                </div>
            )}

            <TransferList
                availableOptions={availablePeriods}
                selectedOptions={selectedPeriodObjects}
                onSelect={handlePeriodSelect}
                onDeselect={handlePeriodDeselect}
            />

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Update
                </button>
            </div>
        </div>
    );
};

export default PeriodPicker;