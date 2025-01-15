import React, { useState } from 'react';
import OrganizationUnitTree, { OrganizationUnit } from './OrganizationUnitTree';


export const TestCustomOrgUnitTree = () => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  const organizationData: OrganizationUnit[] = [
    {
      id: '1',
      name: 'Organization A',
      children: [
        {
          id: '1-1',
          name: 'Department 1',
          children: [
            { id: '1-1-1', name: 'Team 1', children: [
                { id: '1-1-1-1', name: 'Sub 1 Team 1' },
                { id: '1-1-1-2', name: 'Sub 2 Team 2' },
              ], },
            { id: '1-1-2', name: 'Team 2' },
          ],
        },
        {
          id: '1-2',
          name: 'Department 2',
        },
      ],
    },
    {
      id: '2',
      name: 'Organization B',
      children: [
        {
          id: '2-1',
          name: 'Department 1',
        },
      ],
    },
  ];

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedUnits((prev) =>
      checked ? [...prev, id] : prev.filter((unitId) => unitId !== id)
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Organization Units</h1>
      <OrganizationUnitTree
        data={organizationData}
        selectedUnits={selectedUnits}
        onChange={handleCheckboxChange}
      />
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700">Selected Units:</h2>
        <ul className="list-disc pl-6 mt-2 text-gray-600">
          {selectedUnits.map((unitId) => (
            <li key={unitId} className="mt-1">{unitId}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
