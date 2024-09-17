
import { useDataSourceData } from "../../../hooks/DataSourceHooks"
import {Button} from "../../../components/ui/button"
import { IconApps16 } from '@dhis2/ui'
import { Link } from "react-router-dom"
import DataSourceTable from "./DataSourceTable"
import { GenericError, Loading } from "./../../../components"
import {GenericModal} from "../../../components"
import { useState } from "react"
import { DataSourceForm } from "./Components"
import { RiAddFill } from "react-icons/ri"
import { IoIosAddCircle } from "react-icons/io"


const DataSourcePage = () => {

  const  { data, loading, error,refetch }= useDataSourceData()

  const [isShowDataSourceForm,setIsShowDataSourceForm ] = useState<boolean>(false)


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
      <div className=" container flex justify-between py-5" >
        <h3 className="text-[#2C6693] text-xl " >Data source</h3>
        {/* <button
  onClick={handleShowDataSourceForm}
  className="px-4 py-2 bg-[#2C6693] text-white font-medium rounded-lg shadow-sm hover:bg-[#1d4f73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C6693] transition-all duration-200 flex items-center justify-center h-[45px]"
>
  Add Data Source
</button> */}



<Button   onClick={handleShowDataSourceForm} className=" bg-white border 2 border-slate-300 text-slate-900  hover:bg-white hover:text-primary">
<IoIosAddCircle/>&nbsp; Add Data Source
</Button>



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