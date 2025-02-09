import React, { useEffect, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';

const SharedUsersAndGroups = ({savedDashboardData}:{savedDashboardData:any}) => {
  const [accessLevel, setAccessLevel] = useState("View and edit");
  const accessOptions = ["No access", "View only", "View and edit"];
  useEffect(()=>{
     console.log("savedDashboardData?.sharing",savedDashboardData?.sharing
     )
  },[savedDashboardData])
  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-lg font-semibold mb-4">Users and groups that currently have access</h2>
      <div className="border rounded-lg p-4">
        {/* default generic access*/}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-gray-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">All users</p>
              <p className="text-sm text-gray-500">Anyone logged in</p>
            </div>
          </div>
          <div className="relative">
            <select
              className="border rounded-md p-2 text-sm bg-white focus:outline-none focus:ring focus:ring-gray-300"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
            >
              {accessOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* other saved access */}
        <div className='max-h-[200px]  overflow-auto'  >
        {savedDashboardData?.sharing?.map((userOrGroup)=>{
            console.log({userOrGroup})
            return   <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-gray-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">{userOrGroup.name}</p>
                <p className="text-sm text-gray-500">{userOrGroup.id}</p>
              </div>
            </div>
            <div className="relative">
            <select
              className="border rounded-md p-2 text-sm bg-white focus:outline-none focus:ring focus:ring-gray-300"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
            >
              {accessOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          </div>
        })}
        </div>
    
      </div>
    </div>
  );
};

export default SharedUsersAndGroups;
