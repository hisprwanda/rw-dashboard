
import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabBar, Transfer } from '@dhis2/ui';
import { useAuthorities } from '../../../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../../../lib/formatAnalyticsDimensions';
import Button from '../../../../components/Button';
import { IoSaveOutline } from 'react-icons/io5';
import { useRelativePeriodsData } from '../../../../services/FetchRelativePeriods';

const groupedPeriods = {
    days: ['TODAY', 'YESTERDAY', 'LAST_3_DAYS', 'LAST_7_DAYS', 'LAST_14_DAYS', 'LAST_30_DAYS'],
    weeks: ['THIS_WEEK', 'LAST_WEEK', 'LAST_4_WEEKS', 'LAST_12_WEEKS', 'LAST_52_WEEKS'],
    biweeks: ['THIS_BIWEEK', 'LAST_BIWEEK', 'LAST_4_BIWEEKS'],
    months: ['THIS_MONTH', 'LAST_MONTH', 'LAST_3_MONTHS', 'LAST_6_MONTHS', 'LAST_12_MONTHS', 'MONTHS_THIS_YEAR'],
    bimonths: ['THIS_BIMONTH', 'LAST_BIMONTH', 'LAST_6_BIMONTHS'],
    quarters: ['THIS_QUARTER', 'LAST_QUARTER', 'LAST_4_QUARTERS', 'QUARTERS_THIS_YEAR'],
    sixmonths: ['THIS_SIX_MONTH', 'LAST_SIX_MONTH', 'LAST_2_SIXMONTHS'],
    financialYears: ['THIS_FINANCIAL_YEAR', 'LAST_FINANCIAL_YEAR', 'LAST_5_FINANCIAL_YEARS'],
    years: ['THIS_YEAR', 'LAST_YEAR', 'LAST_5_YEARS', 'LAST_10_YEARS', 'LAST_5_FINANCIAL_YEARS', 'LAST_10_FINANCIAL_YEARS']
};

interface PeriodPickerProps {
    setIsShowPeriod: any;
}

const PeriodPicker: React.FC<PeriodPickerProps> = ({ setIsShowPeriod }) => {
    const { data, error, isError, loading } = useRelativePeriodsData();
    const { analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, isFetchAnalyticsDataLoading, selectedDataSourceDetails } = useAuthorities();

    const [selectedTab, setSelectedTab] = useState('relative');
    const [selectedPeriodGroup, setSelectedPeriodGroup] = useState('days'); // Default group
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year by default
    const [availablePeriods, setAvailablePeriods] = useState([]);

    // Handle tab switching (relative vs fixed)
    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        if (tab === 'relative') {
            setAvailablePeriods(filterRelativePeriods(selectedPeriodGroup));
        } else {
            setAvailablePeriods(generateMonthsForYear(selectedYear));
        }
    };

    // Filter relative periods based on the selected group
    const filterRelativePeriods = (group: string) => {
        if (!data?.results) return [];
        const periods = groupedPeriods[group] || [];
        return data.results
            .filter((period: string) => periods.includes(period))
            .map((period: string) => ({ label: period.replace(/_/g, ' '), value: period })); // Format label for readability
    };

    // Generate fixed periods (months for a specific year)
    const generateMonthsForYear = (year: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.map((month, index) => ({
            label: `${month} ${year}`,
            value: `${year}${(index + 1).toString().padStart(2, '0')}`, // Format: YYYYMM
        }));
    };

    // Handle year change for fixed periods
    const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newYear = parseInt(event.target.value, 10);
        setSelectedYear(newYear);
        setAvailablePeriods(generateMonthsForYear(newYear));
    };

    // Handle group change for relative periods
    const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newGroup = event.target.value;
        setSelectedPeriodGroup(newGroup);
        setAvailablePeriods(filterRelativePeriods(newGroup));
    };

    // Handle period selection
    const handlePeriodSelect = ({ selected }) => {
        setAnalyticsDimensions((prev: any) => ({
            ...prev,
            pe: [...selected], 
        }));
    };

    // Handle update button click
    const handleUpdate = async () => {
        await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions), selectedDataSourceDetails);
        setIsShowPeriod(false);
    };

    // Initial setup and reactivity
    useEffect(() => {
        if (selectedTab === 'relative') {
            setAvailablePeriods(filterRelativePeriods(selectedPeriodGroup));
        } else {
            setAvailablePeriods(generateMonthsForYear(selectedYear));
        }
    }, [selectedTab, selectedPeriodGroup, selectedYear, data]);

    return (
        <div style={{ width: '600px', padding: '20px' }}>
            <TabBar>
                <Tab selected={selectedTab === 'relative'} onClick={() => handleTabChange('relative')}>
                    Relative periods
                </Tab>
                <Tab selected={selectedTab === 'fixed'} onClick={() => handleTabChange('fixed')}>
                    Fixed periods
                </Tab>
            </TabBar>

            {selectedTab === 'relative' && (
                <div>
                    <label>Period group</label>
                    <select
                        value={selectedPeriodGroup}
                        onChange={handleGroupChange}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '10px', background: '#fff', zIndex: 1 }}
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
                <div>
                    <label>Year</label>
                    <input
                        type="number"
                        value={selectedYear}
                        onChange={handleYearChange}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '10px', background: '#fff', zIndex: 1 }}
                    />
                </div>
            )}

            <Transfer
                options={availablePeriods}
                selected={analyticsDimensions?.pe}
                onChange={handlePeriodSelect}
                leftHeader="Available Periods"
                rightHeader="Selected Periods"
            />

            <div className="flex justify-end mt-2">
                <Button
                    text={isFetchAnalyticsDataLoading ? 'Loading' : 'Update'}
                    onClick={handleUpdate}
                    variant="primary"
                    type="button"
                    icon={<IoSaveOutline />}
                />
            </div>
        </div>
    );
};

export default PeriodPicker;