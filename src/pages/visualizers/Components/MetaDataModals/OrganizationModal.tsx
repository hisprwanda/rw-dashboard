import React from 'react'
import OrganizationUnitSelector from "../../../../components/OrganisationUnitTree/OrganisationUnitSelector"


interface OrganizationUnitModalProps {
  setIsShowOrganizationUnit?:any;
  data:any;
  loading:boolean;
  error:any;
  isDataModalBeingUsedInMap?:boolean
  
}
const OrganizationModal:React.FC<OrganizationUnitModalProps> = ({setIsShowOrganizationUnit,data,loading,error,isDataModalBeingUsedInMap}) => {
  return (
    <div>
      <OrganizationUnitSelector isDataModalBeingUsedInMap={isDataModalBeingUsedInMap}  data={data} loading={loading}  error={error} setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
    </div>
  )
}

export default OrganizationModal