import React from 'react'
import OrganizationUnitSelector from "../../../../components/OrganisationUnitTree/OrganisationUnitSelector"


interface OrganizationUnitModalProps {
  setIsShowOrganizationUnit?:any;
  data:any;
  loading:boolean;
  error:any
  
}
const OrganizationModal:React.FC<OrganizationUnitModalProps> = ({setIsShowOrganizationUnit,data,loading,error}) => {
  return (
    <div>
      <OrganizationUnitSelector  data={data} loading={loading}  error={error} setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
    </div>
  )
}

export default OrganizationModal