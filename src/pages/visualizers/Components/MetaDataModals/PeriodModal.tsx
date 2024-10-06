import React, { useState, useEffect, useCallback } from 'react';
import {
    Tab,
    TabBar,
    SingleSelectField,
    SingleSelectOption,
    Transfer,
    Button,
    CircularLoader,
} from '@dhis2/ui';
import {
    getFixedPeriodsOptionsById,
    getFixedPeriodsOptions,
    getRelativePeriodsOptionsById,
    getRelativePeriodsOptions,
} from './utils';

interface Period {
    id: string;
    name: string;
}

interface PeriodOption {
    id: string;
    name: string;
    getPeriods: (config?: any) => Period[];
}

type TabType = 'relative' | 'fixed';

interface PeriodModalProps {
    onSelect: (selectedPeriods: string[]) => void;
    periodSettings?: any;
    maxSelections?: number;
    className?: string;
}

const PeriodModal: React.FC<PeriodModalProps> = ({
    onSelect,
    periodSettings = {},
    maxSelections = Infinity,
    className = '',
}) => {
    const [selectedTab, setSelectedTab] = useState<TabType>('relative');
    const [selectedPeriodType, setSelectedPeriodType] = useState<string>('');
    const [availablePeriodTypes, setAvailablePeriodTypes] = useState<PeriodOption[]>([]);
    const [availablePeriods, setAvailablePeriods] = useState<Period[]>([]);
    const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load available period types based on the selected tab
    useEffect(() => {
        const options = selectedTab === 'fixed'
            ? getFixedPeriodsOptions()
            : getRelativePeriodsOptions();
        setAvailablePeriodTypes(options);
        setSelectedPeriodType(options[0]?.id || '');
    }, [selectedTab]);

    // Load periods when period type changes
    const loadPeriods = useCallback(() => {
        if (!selectedPeriodType) return;

        setIsLoading(true);
        try {
            const periodsOption = selectedTab === 'fixed'
                ? getFixedPeriodsOptionsById(selectedPeriodType, periodSettings)
                : getRelativePeriodsOptionsById(selectedPeriodType);

            const periods = periodsOption?.getPeriods() || [];
            setAvailablePeriods(periods);
        } catch (error) {
            console.error('Error loading periods:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriodType, selectedTab, periodSettings]);

    useEffect(() => {
        loadPeriods();
    }, [loadPeriods]);

    const handleTabChange = (tab: TabType) => {
        setSelectedTab(tab);
        setSelectedPeriods([]);
    };

    const handlePeriodTypeChange = ({ selected }: { selected: string; }) => {
        setSelectedPeriodType(selected);
        setSelectedPeriods([]);
    };

    const handleTransferChange = ({ selected }: { selected: string[]; }) => {
        if (selected.length <= maxSelections) {
            setSelectedPeriods(selected);
        }
    };

    const handleConfirm = () => {
        onSelect(selectedPeriods);
    };

    return (
        <div className={`bg-white rounded-lg shadow-md ${className}`}>
            <TabBar className="border-b border-gray-200">
                <Tab
                    selected={selectedTab === 'relative'}
                    onClick={() => handleTabChange('relative')}
                    className="px-4 py-2 text-sm font-medium"
                >
                    Relative periods
                </Tab>
                <Tab
                    selected={selectedTab === 'fixed'}
                    onClick={() => handleTabChange('fixed')}
                    className="px-4 py-2 text-sm font-medium"
                >
                    Fixed periods
                </Tab>
            </TabBar>

            <div className="p-4">
                <SingleSelectField
                    label="Select Period Type"
                    selected={selectedPeriodType}
                    onChange={handlePeriodTypeChange}
                    className="mb-4"
                >
                    {availablePeriodTypes.map(type => (
                        <SingleSelectOption
                            key={type.id}
                            value={type.id}
                            label={type.name}
                        />
                    ))}
                </SingleSelectField>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <CircularLoader />
                    </div>
                ) : (
                    <Transfer
                        options={availablePeriods.map(period => ({
                            label: period.name,
                            value: period.id
                        }))}
                        selected={selectedPeriods}
                        onChange={handleTransferChange}
                        height="300px"
                        filterable
                    />
                )}

                <div className="mt-4 flex justify-end">
                    <Button
                        primary
                        onClick={handleConfirm}
                        disabled={selectedPeriods.length === 0}
                    >
                        Confirm Selection
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PeriodModal;