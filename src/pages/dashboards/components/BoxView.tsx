import {
  IconMore24,
  IconStarFilled24,
  IconVisualizationColumnStacked24,
} from "@dhis2/ui";

type Dashboard = {
  name: string;
  createdAt: string;
  isFavorite: boolean;
};

type BoxViewProps = {
  data: Dashboard[];
};

const BoxView: React.FC<BoxViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 relative"
        >
          <div className="bg-gray-100 h-48 w-full flex justify-center items-center rounded-t-lg">
            <IconVisualizationColumnStacked24 />
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="font-semibold text-gray-700">{item.name}</p>
            <div className="flex items-center space-x-2">
              <IconStarFilled24 />
              <IconMore24 />
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-2">
            Modified: {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BoxView;
