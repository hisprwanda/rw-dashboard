import React, { useEffect, useState } from 'react';
import { Legend } from '../../../types/maps';
import { useFetchSingleLegend, useLegendsData } from '../../../services/fetchLegends';

type LegendSet = {
  displayName: string;
  id: string;
};

type LegendControlsProps = {
  legendType: string;
  setLegendType: (type: string) => void;
  selectedLegendSet: Legend;
  setSelectedLegendSet: (legend: Legend) => void;
};

const LegendControls: React.FC<LegendControlsProps> = ({
  legendType,
  setLegendType,
  selectedLegendSet,
  setSelectedLegendSet,
}) => {
  const { myLegendSets, error, isError, loading } = useLegendsData();
  const {
    data: selectedLegendsData,
    fetchSingleLegendById,
    isLoading: isLoadingFetchSingleLegendById,
    isError: isErrorFetchSingleLegendById
  } = useFetchSingleLegend();

  const [selectedLegendId, setSelectedLegendId] = useState<string>("");

  useEffect(() => {
    // Initialize with first legend set when data is loaded
    if (myLegendSets && myLegendSets.length > 0 && !selectedLegendId) {
      const firstLegendId = myLegendSets[0].id;
      setSelectedLegendId(firstLegendId);
      fetchSingleLegendById({ id: firstLegendId });
    }
  }, [myLegendSets]);

  // Update selectedLegendSet when legend data is fetched
  useEffect(() => {
    if (selectedLegendsData && selectedLegendId) {
      // Find the display name from myLegendSets
      const selectedSet = myLegendSets?.find(set => set.id === selectedLegendId);
      
      // Create a properly formatted Legend object
      const newLegendSet: Legend = {
        name: selectedSet?.displayName || "Unknown Legend",
        legends: selectedLegendsData
      };
      
      setSelectedLegendSet(newLegendSet);
    }
  }, [selectedLegendsData]);

  const handleOnchange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedLegendId(selectedId);
    fetchSingleLegendById({ id: selectedId });
  };

  return (
    <div className="mb-2 p-2">
      <div className="mb-2">
        <label className="mr-4">
          <input
            type="radio"
            value="auto"
            checked={legendType === "auto"}
            onChange={() => setLegendType("auto")}
            className="mb-4"
          />
          Automatic Legend
        </label> <br/>
        <label>
          <input
            type="radio"
            value="dhis2"
            checked={legendType === "dhis2"}
            onChange={() => setLegendType("dhis2")}
            className="mr-1"
          />
          My Legend
        </label>
      </div>
      
      {legendType === "dhis2" && (
        <div>
          {loading ? (
            <p>Loading legend sets...</p>
          ) : isError ? (
            <p>Error loading legend sets: {error}</p>
          ) : (
            <select
              value={selectedLegendId}
              onChange={handleOnchange}
              className="p-2 w-52"
              disabled={isLoadingFetchSingleLegendById}
            >
              {myLegendSets?.map((legendSet) => (
                <option key={legendSet.id} value={legendSet.id}>
                  {legendSet.displayName}
                </option>
              ))}
            </select>
          )}
          {isLoadingFetchSingleLegendById && <p>Loading legend data...</p>}
          {isErrorFetchSingleLegendById && <p>Error loading legend details</p>}
        </div>
      )}
    </div>
  );
};

export default LegendControls;