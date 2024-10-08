import React, { useState, useEffect } from 'react';
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
    getPeriods: (config: Record<string, unknown>) => Period[];
}

type TabType = 'relative' | 'fixed';

interface PeriodModalProps {
    onSelect: (selectedPeriods: string[]) => void;
    onClose: () => void;
    periodSettings?: Record<string, unknown>;
    maxSelections?: number;
}

const PeriodModal: React.FC<PeriodModalProps> = ({
    onSelect,
    onClose,
    periodSettings = {},
    maxSelections = Infinity,
}) => {
    const [selectedTab, setSelectedTab] = useState<TabType>('relative');
    const [selectedPeriodType, setSelectedPeriodType] = useState<string>('');
    const [availablePeriodTypes, setAvailablePeriodTypes] = useState<PeriodOption[]>([]);
    const [availablePeriods, setAvailablePeriods] = useState<Period[]>([]);
    const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const options = selectedTab === 'fixed'
            ? getFixedPeriodsOptions()
            : getRelativePeriodsOptions();
        setAvailablePeriodTypes(options);

        if (options.length > 0 && !selectedPeriodType) {
            setSelectedPeriodType(options[0].id);
        }
    }, [selectedTab]);

    useEffect(() => {
        if (!selectedPeriodType) return;

        setIsLoading(true);
        try {
            const periodsOption = selectedTab === 'fixed'
                ? getFixedPeriodsOptionsById(selectedPeriodType, periodSettings)
                : getRelativePeriodsOptionsById(selectedPeriodType);

            if (periodsOption) {
                // Always pass the periodSettings object to getPeriods
                const periods = periodsOption.getPeriods(periodSettings);
                setAvailablePeriods(periods);
            } else {
                setAvailablePeriods([]);
            }
        } catch (error) {
            console.error('Error loading periods:', error);
            setAvailablePeriods([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriodType, selectedTab, periodSettings]);

    const handleTabChange = (tab: TabType) => {
        setSelectedTab(tab);
        setSelectedPeriods([]);
        setSelectedPeriodType('');
    };

    const handlePeriodTypeChange = ({ selected }: { selected: string; }) => {
        setSelectedPeriodType(selected);
        setSelectedPeriods([]);
    };

    const handleTransferChange = ({ selected }: { selected: string[]; }) => {
        const newSelection = selected.slice(0, maxSelections);
        setSelectedPeriods(newSelection);
    };

    const handleConfirm = () => {
        onSelect(selectedPeriods);
    };

    return (
        <div className="w-full">
            <TabBar>
                <Tab
                    selected={selectedTab === 'relative'}
                    onClick={() => handleTabChange('relative')}
                >
                    Relative periods
                </Tab>
                <Tab
                    selected={selectedTab === 'fixed'}
                    onClick={() => handleTabChange('fixed')}
                >
                    Fixed periods
                </Tab>
            </TabBar>

            <div className="p-4">
                <div className="relative z-50 mb-4">
                    <SingleSelectField
                        label="Select Period Type"
                        selected={selectedPeriodType}
                        onChange={handlePeriodTypeChange}
                    >
                        {availablePeriodTypes.map(type => (
                            <SingleSelectOption
                                key={type.id}
                                value={type.id}
                                label={type.name}
                            />
                        ))}
                    </SingleSelectField>
                </div>

                <div className="relative z-40">
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
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                    <Button secondary onClick={onClose}>
                        Cancel
                    </Button>
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