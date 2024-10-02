import React from 'react'
import OrganizationUnitSelector from "../../../../components/OrganisationUnitTree/OrganisationUnitSelector"
const OrganizationModal = () => {
  return (
    <div>
      <OrganizationUnitSelector/>
    </div>

//     <OrgUnitSelector
//     orgUnitLevels={data?.orgUnitLevels?.organisationUnitLevels}
//     rootOrgUnitsInfo={
//         data?.me?.dataViewOrganisationUnits?.length
//             ? data.me.dataViewOrganisationUnits
//             : data.me.organisationUnits
//     }
//     selectedOrgUnit={selectedOrgUnit}
//     setSelectedOrgUnit={setSelectedOrgUnit}
// />
  )
}

export default OrganizationModal