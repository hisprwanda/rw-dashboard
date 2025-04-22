"use client"

import { useState } from "react";
import  {Button as ButtonUI}  from "../../components/ui/button"
import Button from "../../components/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import BulletinTemplate from "./BulletinTemplate"
import BulletinLanding from "./BulletinLanding";
import { useDataItems } from '../../services/fetchDataItems';
import { useExternalDataItems } from '../../services/useExternalDataItems';
import i18n from '../../locales/index.js';
import { useAuthorities } from '../../context/AuthContext';
import { GenericModal, Loading } from "../../components";
import { DataModal, OrganizationModal, PeriodModal } from '../visualizers/Components/MetaDataModals';
import { useOrgUnitData } from '../../services/fetchOrgunitData';



export default function BulletinSettings() {

  const [isShowDataModal, setIsShowDataModal] = useState<boolean>(false);
  const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState<boolean>(false);
  const [isShowPeriod, setIsShowPeriod] = useState<boolean>(false);
  const { error: dataItemsFetchError, loading: isFetchCurrentInstanceDataItemsLoading, fetchCurrentInstanceData } = useDataItems();
  const { fetchExternalDataItems, response, error, loading: isFetchExternalInstanceDataItemsLoading } = useExternalDataItems();
  const { subDataItemsData, setDataItemsDataPage, dataItemsDataPage, selectedDataSourceOption, setSelectedDataSourceOption, currentUserInfoAndOrgUnitsData, setCurrentUserInfoAndOrgUnitsData, dataItemsData, selectedDataSourceDetails, setSelectedDataSourceDetails, setSelectedDimensionItemType, analyticsData, isFetchAnalyticsDataLoading, selectedChartType, setSelectedChartType, setAnalyticsQuery, isUseCurrentUserOrgUnits, analyticsQuery, analyticsDimensions, setAnalyticsDimensions, setIsSetPredifinedUserOrgUnits, isSetPredifinedUserOrgUnits, selectedOrganizationUnits, setSelectedOrganizationUnits, setIsUseCurrentUserOrgUnits, selectedOrgUnits, setSelectedOrgUnits, selectedOrgUnitGroups, setSelectedOrgUnitGroups, selectedOrganizationUnitsLevels, setSelectedOrganizationUnitsLevels, selectedLevel, setSelectedLevel, fetchAnalyticsData, setAnalyticsData, fetchAnalyticsDataError, visualTitleAndSubTitle, visualSettings, setSelectedVisualSettings, setVisualsColorPalettes, selectedColorPalette, selectedDimensionItemType } = useAuthorities();
  const { loading: orgUnitLoading, error: fetchOrgUnitError, data: orgUnitsData, fetchCurrentUserInfoAndOrgUnitData } = useOrgUnitData();
  const handleShowDataModal = () => setIsShowDataModal(true);
  const handleShowOrganizationUnitModal = () => setIsShowOrganizationUnit(true);
  const handleShowPeriodModal = () => setIsShowPeriod(true);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toolbar */}
      <div className="border-b bg-white">
        <div className="container mx-auto p-4 flex flex-wrap gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-600 mb-1 block">Organisation unit</label>
              <div className="mb-4">                           
                <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading) ? "Loading.." : `${i18n.t('Organization Unit')} `} `} onClick={handleShowOrganizationUnitModal} />
              </div>
             
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-600 mb-1 block">Data</label>
              <div className="mb-4">                
                  <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading) ? "Loading.." : `${i18n.t('Data')} ${analyticsDimensions?.dx?.length === 0 ? "" : `(${analyticsDimensions?.dx?.length})`}`} `} onClick={handleShowDataModal} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-600 mb-1 block">Period</label>
              <div className="mb-4">
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">Period</label> */}
                  <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading) ? "Loading.." : `${i18n.t('Data')} ${analyticsDimensions?.pe?.length === 0 ? "" : `(${analyticsDimensions?.pe?.length})`} `} `} onClick={handleShowPeriodModal} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <ButtonUI className="bg-blue-100 text-blue-700 hover:bg-blue-200">Generate report</ButtonUI>
            <ButtonUI variant="outline">Download</ButtonUI>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-8 text-center">
        <BulletinLanding/>
       
      </main>

     {/* Data, Organization Unit, and Period Modals */}
     <GenericModal isOpen={isShowDataModal} setIsOpen={setIsShowDataModal}>
                        <DataModal data={dataItemsData} loading={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} error={dataItemsFetchError} setIsShowDataModal={setIsShowDataModal} subDataItemsData={subDataItemsData}  />
                    </GenericModal>
                    <GenericModal isOpen={isShowOrganizationUnit} setIsOpen={setIsShowOrganizationUnit}>
                        <OrganizationModal data={currentUserInfoAndOrgUnitsData} loading={orgUnitLoading} error={fetchOrgUnitError} setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
                    </GenericModal>
                    <GenericModal isOpen={isShowPeriod} setIsOpen={setIsShowPeriod}>
                        <PeriodModal setIsShowPeriod={setIsShowPeriod} />
                    </GenericModal>

    </div>
  )
}

