
import { useDataSourceData } from "../../../hooks/DataSourceHooks"
import { Link } from "react-router-dom"
import DataSourceTable from "./DataSourceTable"
import { GenericError, Loading } from "./../../../components"
import {GenericModal} from "../../../components"
import { useState } from "react"
import { DataSourceForm } from "./Components"


const DataSourcePage = () => {

  const  { data, loading, error,refetch }= useDataSourceData()

  const [isShowDataSourceForm,setIsShowDataSourceForm ] = useState<boolean>(false)

  console.log("test returned data", { data, loading, error })

  const handleShowDataSourceForm = ()=>{
    setIsShowDataSourceForm(true)
  }

  /// is loading
  if(loading){
    return <Loading/>
  }

  // is error
  if(error){
    return <GenericError message="fetch data source failed" />
  }
  //main return
  return (<div className="container w-full m-auto  p-2" >
      {/* data source header */}
      <div className=" container flex justify-between p-7 " >
        <h3 className="text-[#2C6693] text-3xl " >Data source</h3>
        <button
  //to="/add-data-source"
  onClick={handleShowDataSourceForm}
  className="text-white bg-[#2C6693] h-[45px] px-2 rounded-md flex items-center justify-center"
>
  Add Data Source 
</button>

      </div>

      {/* testing modal */}

      <GenericModal 
            isOpen={isShowDataSourceForm}
            setIsOpen={setIsShowDataSourceForm}
         >
      <DataSourceForm title="Add Data Source"  action="create" refetch={refetch}  setIsShowDataSourceForm={setIsShowDataSourceForm}  />
          </GenericModal>
      {/* tables of saved data source */}
< DataSourceTable savedDataSourceData={data?.dataStore?.entries} />

    </div>
  )
}

export default DataSourcePage