import React, { useEffect } from 'react';
import { InputField, MultiSelectField, MultiSelectOption, OrganisationUnitTree, CircularLoader } from '@dhis2/ui';
import { useOrgUnitSelection } from '../../hooks/useOrgUnitSelection';
import Button from "../Button";
import { useAuthorities } from '../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';
import { IoSaveOutline } from 'react-icons/io5';
import OrganizationUnitGroup from '../../pages/visualizers/Components/MetaDataModals/OrganizationUnitGroup';
import OrganizationUnitLevels from '../../pages/visualizers/Components/MetaDataModals/OrganizationUnitLevels';
import CustomOrganisationUnitTree from '../../pages/visualizers/Components/MetaDataModals/CustomOrganisationUnitTree';

interface OrganisationUnitSelectProps {
  setIsShowOrganizationUnit:any;
  data:any;
  loading:boolean;
  error:any
  
}

const OrganisationUnitSelect:React.FC<OrganisationUnitSelectProps>  = ({setIsShowOrganizationUnit,data,loading,error}) => {

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
    selectedOrgUnits,
    setSelectedOrgUnits,
    fetchSingleOrgUnitName,
    visualTitleAndSubTitle,
    setSelectedVisualTitleAndSubTitle,  
    selectedDataSourceDetails
  } = useAuthorities();

  //const { loading, error, data } = useOrgUnitData();
  const orgUnits = data?.orgUnits?.organisationUnits || [];
  const orgUnitLevels = data?.orgUnitLevels?.organisationUnitLevels || [];
  const currentUserOrgUnit = data?.currentUser?.organisationUnits?.[0];
    console.log(" data?.currentUser", data?.currentUser)
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
    const updatedOrganizationUnits = selectedOrgUnits.map((path) => {
      // Extract the last segment of the path
      const parts = path.split('/');
      return parts[parts.length - 1]; // Get the last segment (org unit ID)
    });

    setSelectedOrganizationUnits(updatedOrganizationUnits);
  }, [selectedOrgUnits, setSelectedOrganizationUnits]);

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
  

    // Function to fetch and update organization names for selectedOrganizationUnits
    const updateDefaultSubTitle = async () => {
      if (selectedOrganizationUnits.length > 0) {
        // Fetch organization names in parallel
        const orgNames = await Promise.all(
          selectedOrganizationUnits.map((orgUnitId) => fetchSingleOrgUnitName(orgUnitId))
        );
  
        // Update DefaultSubTitle with fetched organization names
        setSelectedVisualTitleAndSubTitle((prevState) => ({
          ...prevState,
          DefaultSubTitle: orgNames, // This will be an array of organization names
        }));
      } else {
        // Clear DefaultSubTitle if no selected organization units
        setSelectedVisualTitleAndSubTitle((prevState) => ({
          ...prevState,
          DefaultSubTitle: [],
        }));
      }
    };
  // test
  useEffect(()=>{
    updateDefaultSubTitle();
   console.log("xxx ++ selectedOrganizationUnits",selectedOrganizationUnits)
    // fetchSingleOrgUnitName
   console.log("yyy selectedOrgUnits",selectedOrgUnits)
  },[selectedOrganizationUnits,selectedOrgUnits])

  useEffect(()=>{
    console.log("visualTitleAndSubTitle wow",visualTitleAndSubTitle)
  },[visualTitleAndSubTitle])

 

  /// handle deselect
  function handleDeselect (){
    handleDeselectAll()
    setSelectedOrgUnitGroups([])
  };

   // Handle update analytics API
   const handleUpdateAnalytics = async () => {
    // Continue with analytics fetch
    await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions),selectedDataSourceDetails)
    setIsShowOrganizationUnit(false)
  };

  /// handle 
  
const handleNodeSelectExternalInstance = (node) => {
  // setSelectedOrgUnits((prevSelected) => {
  //   if (prevSelected.includes(path)) {
  //     return prevSelected.filter((selectedPath) => selectedPath !== path);
  //   } else {
  //     return [...prevSelected, path];
  //   }
  // });
  //selectedOrganizationUnits()
  console.log('external selected node:', node);
};

useEffect(()=>{
  console.log("final selected units external",selectedOrgUnits)
},[selectedOrgUnits])

  // handle loading
  if (loading) {
    return <CircularLoader />;
  }

  // handle error
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
            
               { selectedDataSourceDetails.isCurrentInstance  ? 
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
            />  :
           <CustomOrganisationUnitTree
           apiUrl={selectedDataSourceDetails.url}
           token={selectedDataSourceDetails.token}
           rootOrgUnitId={currentUserOrgUnit.id} 
           onNodeSelect={handleNodeSelectExternalInstance}
           parentName={currentUserOrgUnit?.displayName}
           realParentId={currentUserOrgUnit?.id}
    
       /> }
       
          </div>
      </div>

      {/* MultiSelectField for Organization Unit Level */}
      <div className="mb-6">
        <div className='flex gap-2'   >

        {/* levels test */}
        <OrganizationUnitLevels isUseCurrentUserOrgUnits={isUseCurrentUserOrgUnits}   />
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
