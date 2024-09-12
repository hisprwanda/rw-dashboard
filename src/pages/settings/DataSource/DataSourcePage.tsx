
import { useDataSourceData } from "../../../hooks/DataSourceHooks"
import { Link } from "react-router-dom"
import DataSourceTable from "./DataSourceTable"

const DataSourcePage = () => {

  const  { data, loading, error }= useDataSourceData()

  console.log("test returned data", { data, loading, error })

  return (<div className="container w-full m-auto  p-2" >
      {/* data source header */}
      <div className=" container flex justify-between p-7 " >
        <h3 className="text-[#2C6693]" >Data source</h3>
        <Link
  to="/add-data-source"
  className="text-white bg-[#2C6693] h-[45px] px-2 rounded-md flex items-center justify-center"
>
  Add Data Source 
</Link>

      </div>
      {/* tables of saved data source */}
< DataSourceTable savedDataSourceData={data?.dataStore?.entries} />

    </div>
  )
}

export default DataSourcePage