import React from "react";
import { ArrowUpRight, Mail, Layers, Filter,Cog } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const navigations = [
  { name: "Data Sources", path: "datasource", icon: <ArrowUpRight size={28} /> },
  { name: "Report Config", path: "report", icon: <Cog size={28} /> },
];

const SettingsPage = () => {
    const navigate = useNavigate()

    const handleNavigateTo = (path:string) => {
        navigate(`/${path}`)
    }
  return (
    <div className="min-h-screen bg-gray-100 p-10 ">
      <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto ">
        {navigations.map((item, index) => (
          <div
            key={index}
            onClick={() => handleNavigateTo(item.path)}
            className="bg-white p-6 rounded-lg shadow-md flex items-start gap-4  cursor-pointer  "
          >
            <div className="text-blue-600">{item.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{item.name}</h3>
              <p className="text-gray-600">
                {item.name === "Data Sources"
                  ? "Configure where your data should come from. By default, IDSR pulls data from your DHIS2 instance."
                  : item.name === "Notifications"
                  ? "Configure notifications to send selected reports to respective recipients at defined intervals."
                  : item.name === "DHIS2 Instance"
                  ? "Go and view your DHIS2 instance and related IDSR views."
                  : "Categorize your dashboards and visualizations by creating categories."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
