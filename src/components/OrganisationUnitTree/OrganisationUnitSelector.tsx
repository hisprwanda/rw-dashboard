import React, { useEffect } from 'react';
import { InputField, SingleSelectField, SingleSelectOption, OrganisationUnitTree, CircularLoader } from '@dhis2/ui';
import { useOrgUnitData } from '../../services/fetchOrgunitData';
import { useOrgUnitSelection } from '../../hooks/useOrgUnitSelection';
import Button from "../Button"
import { useAuthorities } from '../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';


const OrganisationUnitMultiSelect = () => {
  const {analyticsDimensions,setAnalyticsDimensions,fetchAnalyticsData,fetchAnalyticsDataError,isFetchAnalyticsDataLoading,setSelectedOrganizationUnits,selectedOrganizationUnits,isUseCurrentUserOrgUnits, setIsUseCurrentUserOrgUnits} = useAuthorities()
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

  // handle onchange of currentOrgUnit
   const handleCurrentOrgUnitChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setIsUseCurrentUserOrgUnits(e.target.checked);

   }


  // handle update analytics API
  const handleUpdateAnalytics = async() => {
    // Set analytics dimensions based on selected org units
    console.log("selected org units",selectedOrgUnits)
    // Extract the last org unit ID from the path
    const lastSelectedOrgUnit = selectedOrgUnits.length
        ? selectedOrgUnits[selectedOrgUnits.length - 1].split('/').filter(Boolean).pop()  // Get the last path and extract the last org unit
        : null;

        await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions) )

    console.log("Last selected org unit:", lastSelectedOrgUnit);

  };


  // testing 
     useEffect(()=>{
      const lastSelectedOrgUnit = selectedOrgUnits.length
      ? selectedOrgUnits[selectedOrgUnits.length - 1].split('/').filter(Boolean).pop()  // Get the last path and extract the last org unit
      : null;

      setSelectedOrganizationUnits((prev:any) => {
        // Check if lastSelectedOrgUnit is valid (not null, undefined, or an empty string)
        if (lastSelectedOrgUnit) {
            return [...prev, lastSelectedOrgUnit];
        }
        
        // If lastSelectedOrgUnit is invalid, return the previous state without changes
        return prev;
    });
    
  console.log("Last selected org unit tets:", lastSelectedOrgUnit);
     },[selectedOrgUnits])



     /// test total selected org units
     useEffect(()=>{
     console.log("Total selected org units final x:",selectedOrganizationUnits);
     },[selectedOrganizationUnits])
  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Select Organization Units</h2>

      {/* Search input field */}
      {/* <div className="mb-4">
        <InputField
          className="w-full"
          label="Search Organization Unit"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.value || '')}
          placeholder="Type to search..."
        />
      </div> */}
           {/* check if you want to use current user org unit */}
           <div className="flex items-center space-x-2 p-2 bg-gray-50 border rounded-md shadow-sm mb-8">
  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded"  checked={isUseCurrentUserOrgUnits} onChange={handleCurrentOrgUnitChange} />
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

      {/* Select field for organization unit level */}
      <div className="mb-6">
        <SingleSelectField
          className="w-full"
          label="Choose an Organisation Unit Level"
          onChange={({ selected }) => setSelectedLevel(Number(selected))}
          selected={selectedLevel ? String(selectedLevel) : undefined}
          placeholder="Select level"
        >
          {orgUnitLevels.map((level: { id: string; displayName: string; level: number; }) => (
            <SingleSelectOption key={level.id} value={String(level.level)} label={level.displayName} />
          ))}
        </SingleSelectField>
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
         text=' Submit Selected Org Units'
          onClick={handleUpdateAnalytics} />
         
        
      </div>
    </div>
  );
};

export default OrganisationUnitMultiSelect;
