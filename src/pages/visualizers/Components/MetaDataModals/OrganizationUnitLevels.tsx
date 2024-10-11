import React, { useState, useEffect } from 'react';
import { MultiSelectField, MultiSelectOption, CircularLoader } from '@dhis2/ui';
import { useAuthorities } from '../../../../context/AuthContext';
import { useOrgUnitData } from '../../../../services/fetchOrgunitData';

interface OrganizationUnitLevelsProps {

  isUseCurrentUserOrgUnits: boolean;
}

const OrganizationUnitLevels: React.FC<OrganizationUnitLevelsProps> = ({
 
  isUseCurrentUserOrgUnits,
}) => {
    const { data, error, loading } = useOrgUnitData();
    const {setSelectedOrganizationUnitsLevels,selectedLevel,setSelectedLevel} = useAuthorities()

    // states
    useEffect(()=>{
   console.log("test select",selectedLevel)
    },[selectedLevel])
    
  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }
  
  const orgUnitLevels = data?.orgUnitLevels?.organisationUnitLevels || [];
  const handleChange = ({ selected }: { selected: string[] }) => {
    const selectedLevelsAsNumbers = selected.map(Number);
    setSelectedLevel(selectedLevelsAsNumbers);

    const selectedLevelIds = orgUnitLevels
      .filter(level => selected.includes(String(level.level)))
      .map(level => level.id);

    setSelectedOrganizationUnitsLevels(selectedLevelIds);
  };

  return (
    <MultiSelectField
      disabled={isUseCurrentUserOrgUnits}
      className="w-full"
      label="Choose Organisation Unit Levels"
      onChange={handleChange}
      selected={selectedLevel ? selectedLevel.map(String) : []}
      placeholder="Select levels"
    >
      {orgUnitLevels.map((level) => (
        <MultiSelectOption key={level.id} value={String(level.level)} label={level.displayName} />
      ))}
    </MultiSelectField>
  );
};

export default OrganizationUnitLevels;
