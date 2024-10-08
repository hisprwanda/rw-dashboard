import React, { useEffect } from 'react';
import { InputField, MultiSelectField, MultiSelectOption, OrganisationUnitTree, CircularLoader } from '@dhis2/ui';
import { useOrgUnitData } from '../../services/fetchOrgunitData';
import { useOrgUnitSelection } from '../../hooks/useOrgUnitSelection';
import Button from "../Button";
import { useAuthorities } from '../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';
import { IoSaveOutline } from 'react-icons/io5';
import OrganizationUnitGroup from '../../pages/visualizers/Components/MetaDataModals/OrganizationUnitGroup';

interface OrganisationUnitSelectProps {
  setIsShowOrganizationUnit:any
}

const OrganisationUnitSelect:React.FC<OrganisationUnitSelectProps>  = ({setIsShowOrganizationUnit}) => {
  const {
    analyticsDimensions,
    setAnalyticsDimensions,
    fetchAnalyticsData,
    fetchAnalyticsDataError,
    isFetchAnalyticsDataLoading,
    setSelectedOrganizationUnits,
    selectedOrganizationUnits,
    isUseCurrentUserOrgUnits,
    setIsUseCurrentUserOrgUnits,
    selectedOrganizationUnitsLevels,
    setSelectedOrganizationUnitsLevels,
    setSelectedOrgUnitGroups
  } = useAuthorities();

  const { loading, error, data } = useOrgUnitData();
  const orgUnits = data?.orgUnits?.organisationUnits || [];
  const orgUnitLevels = data?.orgUnitLevels?.organisationUnitLevels || [];
  const currentUserOrgUnit = data?.currentUser?.organisationUnits?.[0];

  const {
    selectedOrgUnits,
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setSelectedLevel,
    handleOrgUnitClick,
    handleDeselectAll,
    filteredOrgUnitPaths,
  } = useOrgUnitSelection(orgUnits);

  // Handle change of currentOrgUnit
  const handleCurrentOrgUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUseCurrentUserOrgUnits(e.target.checked);
  };


  // Update selectedOrgUnit
  useEffect(() => {
    const lastSelectedOrgUnit = selectedOrgUnits.length
      ? selectedOrgUnits[selectedOrgUnits.length - 1].split('/').filter(Boolean).pop()
      : null;

    setSelectedOrganizationUnits((prev: any) => {
      if (lastSelectedOrgUnit) {
        // Check if the last selected org unit already exists in the previous selection
        if (!prev.includes(lastSelectedOrgUnit)) {
          return [...prev, lastSelectedOrgUnit];
        }
      }
      return prev;
    });

  }, [selectedOrgUnits]);

  // Set selected organization unit levels when selectedLevel changes
  useEffect(() => {
    const selectedLevelIds = orgUnitLevels
      .filter(level => selectedLevel?.includes(level.level))
      .map(level => level.id);
    setSelectedOrganizationUnitsLevels(selectedLevelIds);
  }, [selectedLevel, orgUnitLevels, setSelectedOrganizationUnitsLevels]);

  /// handle deselect
  const handleDeselect = () => {
    handleDeselectAll()
    setSelectedOrgUnitGroups([])
  };

   // Handle update analytics API
   const handleUpdateAnalytics = async () => {
     console.log({selectedOrganizationUnitsLevels})
     console.log({selectedOrganizationUnits})
    // Continue with analytics fetch
    await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions))
    setIsShowOrganizationUnit(false)
  };

  /// handle loading
  if (loading) {
    return <CircularLoader />;
  }

  /// handle error
  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  /// main return 
  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 ">Organisation Units</h2>

      {/* Current User Org Unit Checkbox */}
      <div className="flex items-center space-x-2 p-2 bg-gray-50 border rounded-md shadow-sm mb-8">
        <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" checked={isUseCurrentUserOrgUnits} onChange={handleCurrentOrgUnitChange} />
        <span className="text-gray-700 font-medium ml-3">User Organization Unit</span>
      </div>

      {/* Organization Unit Tree */}
      <div className=" p-4 rounded-lg mb-6 ">
        {currentUserOrgUnit && (
          <div>
            <OrganisationUnitTree
              disableSelection={isUseCurrentUserOrgUnits}
              roots={[currentUserOrgUnit.id]}
              selected={selectedOrgUnits}
              onChange={({ path }) => handleOrgUnitClick(path)}
              singleSelection={false}
              renderNodeLabel={({ node }) => (
                <span className="text-blue-600 font-medium">{node.displayName}</span>
              )}
              filter={filteredOrgUnitPaths.length ? filteredOrgUnitPaths : undefined}
            />
          </div>
        )}
      </div>

      {/* MultiSelectField for Organization Unit Level */}
      <div className="mb-6">
        <div className='flex gap-2'   >
        <MultiSelectField
          disabled={isUseCurrentUserOrgUnits}
          className="w-full"
          label="Choose Organisation Unit Levels"
          onChange={({ selected }) => {
            setSelectedLevel(selected?.map(Number)); // Accept multiple selections
            // Set the selected levels directly as IDs
            const selectedLevelIds = orgUnitLevels
              .filter(level => selected?.includes(String(level.level)))
              .map(level => level.id);
            setSelectedOrganizationUnitsLevels(selectedLevelIds); // Update organization unit levels
          }}
          selected={selectedLevel ? selectedLevel.map(String) : []}
          placeholder="Select levels"
        >
          {orgUnitLevels.map((level) => (
            <MultiSelectOption key={level.id} value={String(level.level)} label={level.displayName} />
          ))}
        </MultiSelectField>
        {/* organization unit group */}
        <OrganizationUnitGroup isUseCurrentUserOrgUnits={isUseCurrentUserOrgUnits} />
        </div>
 
        <button
  disabled={isUseCurrentUserOrgUnits}
  className="text-gray-500 mt-2 hover:text-gray-700 border border-gray-300 rounded-xl px-2 py-1"
  onClick={handleDeselect}
>
  Deselect all
</button>


      </div>

      {/* Buttons */}
      <div className="flex justify-end items-center">
        <div>
        <Button
          variant='primary'
          text={isFetchAnalyticsDataLoading ? "Loading" : "Update"}
          onClick={handleUpdateAnalytics}
          disabled={isFetchAnalyticsDataLoading}
          icon={<IoSaveOutline />} 
        />
        </div>
      
      </div>
    </div>
  );
};

export default OrganisationUnitSelect;
