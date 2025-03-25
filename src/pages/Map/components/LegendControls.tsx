import React from 'react';
import { Legend } from '../../../types/maps';

type LegendControlsProps = {
  legendType: string;
  setLegendType: (type: string) => void;
  selectedLegendSet: Legend;
  setSelectedLegendSet: (legend: Legend) => void;
  sampleLegends: Legend[];
};

const LegendControls: React.FC<LegendControlsProps> = ({
  legendType,
  setLegendType,
  selectedLegendSet,
  setSelectedLegendSet,
  sampleLegends
}) => {
  return (
    <div className="mb-2 p-2">
      <div className="mb-2">
        <label className="mr-4">
          <input
            type="radio"
            value="auto"
            checked={legendType === "auto"}
            onChange={() => setLegendType("auto")}
            className="mr-1"
          />
          Automatic Legend
        </label>
        <label>
          <input
            type="radio"
            value="dhis2"
            checked={legendType === "dhis2"}
            onChange={() => setLegendType("dhis2")}
            className="mr-1"
          />
          DHIS2 Legend
        </label>
      </div>
      
      {legendType === "dhis2" && (
        <select
          value={selectedLegendSet.name}
          onChange={(e) => {
            const selected = sampleLegends.find(legend => legend.name === e.target.value);
            if (selected) setSelectedLegendSet(selected);
          }}
          className="p-2 w-52"
        >
          {sampleLegends.map((legend, index) => (
            <option key={index} value={legend.name}>
              {legend.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default LegendControls;