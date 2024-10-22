import React from 'react'
import OrganizationUnitSelector from "../../../../components/OrganisationUnitTree/OrganisationUnitSelector"


interface OrganizationUnitModalProps {
  setIsShowOrganizationUnit:any;
  
}
const OrganizationModal:React.FC<OrganizationUnitModalProps> = ({setIsShowOrganizationUnit}) => {
  return (
    <div>
      <OrganizationUnitSelector setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
    </div>
  )
}

export default OrganizationModal