import React, { useEffect, useState } from 'react';
import Button from "../../components/Button";
import { IoIosAddCircle } from 'react-icons/io';
import { IoSaveOutline } from 'react-icons/io5';
import { useDataSourceData } from '../../services/DataSourceHooks';
import { generateUid } from '../../lib/uid';
import { GenericModal, Loading } from "../../components";
import { DataModal, OrganizationModal, PeriodModal } from './Components/MetaDataModals';
import { useAnalyticsData } from '../../services/Analytics';
import { useAuthorities } from '../../context/AuthContext';
import { LocalBarChart } from '../../components/charts/LocalBarChart';
import { LocalLineChart } from '../../components/charts/LocalLineChart';

import { someAnalyticsData } from '../../data/someAnalyticsData';

type DataObject = {
    dx: string[],
    pe: string[],
    ou: string[];
};

function formatAnalyticsData(data: DataObject): string[] {
    const result: string[] = [];

    if (data.dx.length > 0) {
        result.push(`dx:${data.dx.join(';')}`);
    }

    if (data.pe.length > 0) {
        result.push(`pe:${data.pe.join(';')}`);
    }

    if (data.ou.length > 0) {
        result.push(`ou:${data.ou.join(',')}`);
    }

    return result;
}

export default function Visualizers() {
    const { data, loading, error } = useDataSourceData();
    const { analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, analyticsData, isFetchAnalyticsDataLoading, fetchAnalyticsDataError } = useAuthorities();
    // console.log("tets name",analyticsDimensions)
    const [isShowDataModal, setIsShowDataModal] = useState(false);
    const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState(false);
    const [isShowPeriod, setIsShowPeriod] = useState(false);


    const dataSourceOptions = data?.dataStore?.entries?.map((entry: any, index: number) => <option key={entry?.key} value={entry?.key}>{entry?.value?.instanceName}</option>);

    /// handle show data select modal
    const handleShowDataModal = () => {
        setIsShowDataModal(true);
    };

    /// handle show data select modal
    const handleShowOrganizationUnitModal = () => {
        setIsShowOrganizationUnit(true);
    };

    /// handle show data select modal
    const handleShowPeriodModal = () => {
        setIsShowPeriod(true);
    };


    useEffect(() => {
        console.log("analyticsData fetched ", { analyticsData, isFetchAnalyticsDataLoading });
    }, [analyticsData]);

    /// main return
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
                            {dataSourceOptions}
                        </select>
                    </div>
                    {/* Indicators */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>

                        <Button variant="source" text="Add +" onClick={handleShowDataModal} />
                    </div>
                    {/* Period */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                        <Button variant="source" text="Add +" onClick={handleShowPeriodModal} />
                    </div>
                    {/* Organization Unit */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Unit</label>
                        <Button variant="source" text="Add +" onClick={handleShowOrganizationUnitModal} />
                    </div>

                </div>

                {/* Visualization Area */}
                <div className="flex-grow bg-white shadow-md p-4 rounded-lg mx-4">
                    <div className="flex justify-end mb-4">

                        <Button variant="primary" text="Save" type="button"
                            icon={<IoSaveOutline />} />
                    </div>
                    <div className="h-[600px] flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100">
                        {isFetchAnalyticsDataLoading ? (
                            <Loading />
                        ) : (
                            <div className="flex items-center justify-center w-full h-[600px]">
                                <div className="w-[100%] max-h-[100%]">
                                    {/* <LocalBarChart data={analyticsData} /> */}
                                    <LocalLineChart data={analyticsData} />
                                    
                                </div>
                            </div>
                        )}
                    </div>




                </div>
            </div>
            {/* select data modal */}
            <GenericModal
                isOpen={isShowDataModal}
                setIsOpen={setIsShowDataModal}
            >
                <DataModal setIsShowDataModal={setIsShowDataModal} />
            </GenericModal>
            {/* Organization unit */}
            <GenericModal
                isOpen={isShowOrganizationUnit}
                setIsOpen={setIsShowOrganizationUnit}
            >
                <OrganizationModal setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
            </GenericModal>
            {/* Period */}
            <GenericModal
                isOpen={isShowPeriod}
                setIsOpen={setIsShowPeriod}
            >
                <PeriodModal setIsShowPeriod={setIsShowPeriod} />
            </GenericModal>
        </div>
    );
}
