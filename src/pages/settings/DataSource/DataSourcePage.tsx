
import MantineTable from "../MantineTable"
import { Link } from "react-router-dom"

const DataSourcePage = () => {
  
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
<MantineTable/>

    </div>
  )
}

export default DataSourcePage