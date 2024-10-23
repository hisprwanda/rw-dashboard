import React, { useEffect } from 'react';
import { InputField, MultiSelectField, MultiSelectOption, OrganisationUnitTree, CircularLoader } from '@dhis2/ui';
import { useOrgUnitData } from '../../services/fetchOrgunitData';
import { useOrgUnitSelection } from '../../hooks/useOrgUnitSelection';
import Button from "../Button";
import { useAuthorities } from '../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';
import { IoSaveOutline } from 'react-icons/io5';
import OrganizationUnitGroup from '../../pages/visualizers/Components/MetaDataModals/OrganizationUnitGroup';
import OrganizationUnitLevels from '../../pages/visualizers/Components/MetaDataModals/OrganizationUnitLevels';

interface OrganisationUnitSelectProps {
  setIsShowOrganizationUnit:any;
  
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
    setSelectedOrgUnitGroups,
    isSetPredifinedUserOrgUnits,setIsSetPredifinedUserOrgUnits,
    selectedOrgUnits
  } = useAuthorities();

  const { loading, error, data } = useOrgUnitData();
  const orgUnits = data?.orgUnits?.organisationUnits || [];
  const orgUnitLevels = data?.orgUnitLevels?.organisationUnitLevels || [];
  const currentUserOrgUnit = data?.currentUser?.organisationUnits?.[0];

  const {
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setSelectedLevel,
    handleOrgUnitClick,
    handleDeselectAll,
    filteredOrgUnitPaths,
  } = useOrgUnitSelection(orgUnits);

  // Handle change of currentOrgUnit
  const handleCurrentOrgUnitChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {

    const updatedPredifinedUserOrgUnits = {
      ...isSetPredifinedUserOrgUnits,
      [key]: e.target.checked,
    };
    setIsSetPredifinedUserOrgUnits(updatedPredifinedUserOrgUnits);
  
    // Check if any of the properties are true; if none are true, set isUseCurrentUserOrgUnits to false
    const isAnyTrue = Object.values(updatedPredifinedUserOrgUnits).some(value => value === true);
    setIsUseCurrentUserOrgUnits(isAnyTrue);
    // clear existing other org units
    handleDeselect()
  };


  

  // Update selectedOrgUnit
  useEffect(() => {
    const lastSelectedOrgUnit = selectedOrgUnits?.length
      ? selectedOrgUnits[selectedOrgUnits?.length - 1].split('/').filter(Boolean).pop()
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
  // useEffect(() => {
  //   const selectedLevelIds = orgUnitLevels
  //     .filter(level => selectedLevel?.includes(level.level))
  //     .map(level => level.id);
  //   setSelectedOrganizationUnitsLevels(selectedLevelIds);
  // }, [selectedLevel, orgUnitLevels, setSelectedOrganizationUnitsLevels]);

  useEffect(() => {
    if (selectedLevel && selectedLevel.length > 0) {
      const newSelectedLevelIds = orgUnitLevels
        .filter(level => selectedLevel.includes(level.level))
        .map(level => level.id);
  
      // Merge existing levels with new ones and avoid duplicates
      setSelectedOrganizationUnitsLevels((prevLevels: string[]) => {
        const mergedLevels = new Set([...prevLevels, ...newSelectedLevelIds]);
        return Array.from(mergedLevels);
      });
    }
  }, [selectedLevel, orgUnitLevels, setSelectedOrganizationUnitsLevels]);
  

  /// handle deselect
  function handleDeselect (){
    handleDeselectAll()
    setSelectedOrgUnitGroups([])
  };

   // Handle update analytics API
   const handleUpdateAnalytics = async () => {
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
      <div className="flex items-center gap-5 space-x-2 p-2 bg-gray-50 border rounded-md shadow-sm mb-8">
    {/* User Organization Unit */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-600 rounded"
        checked={isSetPredifinedUserOrgUnits?.is_USER_ORGUNIT}
        onChange={(e) => handleCurrentOrgUnitChange(e, 'is_USER_ORGUNIT')}
      />
      <span className="text-gray-700 font-medium">User Organization Unit</span>
    </div>
    
    {/* User sub-units */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-600 rounded"
        checked={isSetPredifinedUserOrgUnits?.is_USER_ORGUNIT_CHILDREN}
        onChange={(e) => handleCurrentOrgUnitChange(e, 'is_USER_ORGUNIT_CHILDREN')}
      />
      <span className="text-gray-700 font-medium">User sub-units</span>
    </div>
    
    {/* User sub-x2-units */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-600 rounded"
        checked={isSetPredifinedUserOrgUnits?.is_USER_ORGUNIT_GRANDCHILDREN}
        onChange={(e) => handleCurrentOrgUnitChange(e, 'is_USER_ORGUNIT_GRANDCHILDREN')}
      />
      <span className="text-gray-700 font-medium">User sub-x2-units</span>
    </div>
  </div>

      {/* Organization Unit Tree */}
      <div className=" p-4 rounded-lg mb-6 ">
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
              filter={filteredOrgUnitPaths?.length ? filteredOrgUnitPaths : undefined}
            />
          </div>
      </div>

      {/* MultiSelectField for Organization Unit Level */}
      <div className="mb-6">
        <div className='flex gap-2'   >
        {/* organization unit group */}
        <OrganizationUnitGroup isUseCurrentUserOrgUnits={isUseCurrentUserOrgUnits} />
        {/* levels test */}
        <OrganizationUnitLevels isUseCurrentUserOrgUnits={isUseCurrentUserOrgUnits}   />
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
