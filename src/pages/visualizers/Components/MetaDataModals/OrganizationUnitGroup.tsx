import React, { useState } from 'react';
import { MultiSelectField, MultiSelectOption, CircularLoader } from '@dhis2/ui';
import { useSingleOrgUnitGroupsData } from '../../../../services/fetchOrgUnitGroups';
import { useAuthorities } from '../../../..//context/AuthContext';


interface OrganizationUnitGroupProps {
  isUseCurrentUserOrgUnits:boolean
}

const OrganizationUnitGroup:React.FC<OrganizationUnitGroupProps> = ({isUseCurrentUserOrgUnits}) => {
  const {selectedOrgUnitGroups,setSelectedOrgUnitGroups} = useAuthorities()
  const { data, error, loading } = useSingleOrgUnitGroupsData();


  console.log("organization unit group data", data);

  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  const orgUnitGroups = data?.organisationUnitGroups?.organisationUnitGroups || [];

  const handleChange = ({ selected }) => {
    setSelectedOrgUnitGroups(selected);
    console.log("Selected Organisation Unit Groups:", selected);
  };

  return (<MultiSelectField
        className="w-full"
        disabled={isUseCurrentUserOrgUnits} 
        label="Choose Organization Unit Groups"
        onChange={handleChange} // Update the selected org unit groups
        selected={selectedOrgUnitGroups}
        placeholder="Select organization unit groups"
      >
        {orgUnitGroups.map((group) => (
          <MultiSelectOption key={group.id} value={group.id} label={group.displayName} />
        ))}
      </MultiSelectField>
  



  );
};

export default OrganizationUnitGroup;
