import { DataSourceResponse } from "@/types/DataSource";
import ShowData from "./show-data";
import EditData from "./edit-data";
import DeleteData from "./delete-data";

interface TableActionsProps {
  row: DataSourceResponse;
  refetch: () => void;
}
export default function TableActions({ row, refetch }: TableActionsProps) {
  return (
    <div>
      <ShowData refetch={refetch} row={row} />
      <EditData refetch={refetch} row={row} />
      <DeleteData refetch={refetch} row={row} />
    </div>
  );
}
