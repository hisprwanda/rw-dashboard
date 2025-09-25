import React from "react";
import { ArrowUpRight, Mail, Layers, Filter,Cog,AudioLines } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const navigations = [
  { name: "Data Sources", description: "Configure where your data should come from.", path: "datasource", icon: <ArrowUpRight size={28} /> },
  { name: "Audio", description: "Manage audio files and settings.", path: "audio", icon: <AudioLines size={28} /> },
  // { name: "Report Config", description: "Configure report settings and templates.", path: "report", icon: <Cog size={28} /> },
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
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
