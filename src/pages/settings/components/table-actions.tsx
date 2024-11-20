import { DataSourceResponse } from "@/types/DataSource";
import ShowData from "./show-data";
import EditData from "./edit-data";
import DeleteData from "./delete-data";

interface TableActionsProps {
  row: DataSourceResponse;
  dataSource:DataSourceResponse[];
  refetch: () => void;
}
export default function TableActions({ row, refetch,dataSource }: TableActionsProps) {
  return (
    <div>
      <ShowData refetch={refetch} row={row} dataSource={dataSource} />
      <EditData refetch={refetch} row={row} dataSource={dataSource}  />
      <DeleteData refetch={refetch} row={row} dataSource={dataSource}  />
    </div>
  );
}
