
import { useDataSourceData } from "../../../services/DataSourceHooks"
import DataSourceTable from "./Components/DataSourceTable"
import { GenericError, Loading } from "./../../../components"
import {GenericModal} from "../../../components"
import { useState } from "react"
import { DataSourceForm } from "./Components"
import { IoIosAddCircle } from "react-icons/io"
import Button from "../../../components/Button"
import { FaCheck } from "react-icons/fa"
import i18n from '../../../locales/index.js'


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
        <h3 className="text-[#2C6693] text-xl font-bold " >{i18n.t('Data Source')}</h3>

<Button variant="primary" text={i18n.t('New data source')}   type="button"
      onClick={handleShowDataSourceForm}  icon={<IoIosAddCircle />} />


      </div>

      {/* testing modal */}

      <GenericModal 
            isOpen={isShowDataSourceForm}
            setIsOpen={setIsShowDataSourceForm}
         >
      <DataSourceForm title={i18n.t('Data Source Details')} action="create"  refetch={refetch}  setIsShowDataSourceForm={setIsShowDataSourceForm}  />
          </GenericModal>
      {/* tables of saved data source */}
< DataSourceTable savedDataSourceData={data?.dataStore?.entries} />

    </div>
  )
}

export default DataSourcePage