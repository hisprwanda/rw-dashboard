import React, { useEffect } from 'react';
import { InputField, MultiSelectField, MultiSelectOption, OrganisationUnitTree, CircularLoader } from '@dhis2/ui';
import { useOrgUnitData } from '../../services/fetchOrgunitData';
import { useOrgUnitSelection } from '../../hooks/useOrgUnitSelection';
import Button from "../Button";
import { useAuthorities } from '../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';

const OrganisationUnitSelect = () => {
  const { analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, fetchAnalyticsDataError, isFetchAnalyticsDataLoading, setSelectedOrganizationUnits, selectedOrganizationUnits, isUseCurrentUserOrgUnits, setIsUseCurrentUserOrgUnits,selectedOrganizationUnitsLevels,setSelectedOrganizationUnitsLevels } = useAuthorities();
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

  // Handle update analytics API
  const handleUpdateAnalytics = async () => {
    console.log("selected org units", selectedOrgUnits);

    // Extract the last org unit ID from the path
    const lastSelectedOrgUnit = selectedOrgUnits.length
      ? selectedOrgUnits[selectedOrgUnits.length - 1].split('/').filter(Boolean).pop()
      : null;

    // Continue with analytics fetch
    // await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions))

    console.log("selected org unit:", selectedOrganizationUnits);
    // Log the selected level IDs
    const selectedLevelIds = orgUnitLevels.filter(level => selectedLevel?.includes(level.level))?.map(level => level.id);
    console.log("selected level IDs:", selectedLevelIds);
  };

  // Testing useEffect for selecting organization units
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

  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Select Organization Units</h2>

      {/* Current User Org Unit Checkbox */}
      <div className="flex items-center space-x-2 p-2 bg-gray-50 border rounded-md shadow-sm mb-8">
        <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" checked={isUseCurrentUserOrgUnits} onChange={handleCurrentOrgUnitChange} />
        <span className="text-gray-700 font-medium ml-3">User Organization Unit</span>
      </div>

      {/* Organization Unit Tree */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-inner">
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
        <MultiSelectField
          className="w-full"
          label="Choose Organisation Unit Levels"
          onChange={({ selected }) => setSelectedLevel(selected.map(Number))} // Accept multiple selections
          selected={selectedLevel ? selectedLevel.map(String) : []}
          placeholder="Select levels"
        >
          {orgUnitLevels.map((level) => (
            <MultiSelectOption key={level.id} value={String(level.level)} label={level.displayName} />
          ))}
        </MultiSelectField>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center">
        <Button
          text='Deselect All'
          variant='danger'
          type='button'
          onClick={handleDeselectAll}
        />

        <Button
          variant='primary'
          text='Submit Selected Org Units'
          onClick={handleUpdateAnalytics}
        />
      </div>
    </div>
  );
};

export default OrganisationUnitSelect;
