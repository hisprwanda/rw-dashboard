import React, { useState, useEffect } from 'react';
import { MdOutlineExpandLess } from "react-icons/md";
import { MdOutlineExpandMore } from "react-icons/md";
import { RiExpandLeftRightFill } from "react-icons/ri";

type OrganizationUnit = {
  id: string;
  name: string;
  children?: OrganizationUnit[];
};

type OrganizationUnitTreeProps = {
  data: OrganizationUnit[];
  selectedUnits: string[];
  onChange: (id: string, checked: boolean) => void;
};

const OrganizationUnitTree: React.FC<OrganizationUnitTreeProps> = ({
  data,
  selectedUnits,
  onChange,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [unitsWithSelectedDescendants, setUnitsWithSelectedDescendants] = useState<string[]>([]);

  const handleToggleExpand = (id: string) => {
    setExpandedNodes((prev) =>
      prev.includes(id) ? prev.filter((nodeId) => nodeId !== id) : [...prev, id]
    );
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    onChange(id, checked);
  };

  const checkSelectedDescendants = (unit: OrganizationUnit): boolean => {
    if (unit.children) {
      return unit.children.some((child) => selectedUnits.includes(child.id) || checkSelectedDescendants(child));
    }
    return false;
  };

  const renderTree = (units: OrganizationUnit[]) => {
    return units.map((unit) => {
      const hasSelectedDescendants = checkSelectedDescendants(unit);

      return (
        <div key={unit.id} className="ml-4">
          <div className="flex items-center">
          {unit.children && unit.children.length > 0 && (
              <button
                onClick={() => handleToggleExpand(unit.id)}
                className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                {expandedNodes.includes(unit.id) ? <MdOutlineExpandLess/> : <RiExpandLeftRightFill/>}
              </button>
            )}
            <input
              type="checkbox"
              checked={selectedUnits.includes(unit.id)}
              onChange={(e) => handleCheckboxChange(unit.id, e.target.checked)}
              id={unit.id}
              className="h-4 w-4"
            />
            
            <label htmlFor={unit.id} className="ml-2 text-gray-800 font-medium">
              {unit.name}
            </label>
            {hasSelectedDescendants && (
              <span className="ml-2 text-sm text-green-600"> (Child selected)</span>
            )}
          
          </div>
          {unit.children && expandedNodes.includes(unit.id) && (
            <div>{renderTree(unit.children)}</div>
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    // Update parent nodes with descendants' selected state
    const updatedUnits = data.filter(checkSelectedDescendants).map(unit => unit.id);
    setUnitsWithSelectedDescendants(updatedUnits);
  }, [selectedUnits, data]);

  return <div>{renderTree(data)}</div>;
};

export default OrganizationUnitTree;
