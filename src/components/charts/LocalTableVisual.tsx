import React, { useState, useMemo } from "react";
import { Table, Input } from "@mantine/core";  // Mantine components for table and input
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";
import { VisualHeading } from "./VisualHeading";

export const LocalTableVisual: React.FC<genericChartsProps> = ({
    data,
    visualTitleAndSubTitle,
    visualSettings,
    metaDataLabels,
    analyticsPayloadDeterminer
  }) => {
    const { chartData, error } = useMemo(() => {
      if (!isValidInputData(data)) {
        return { chartData: [], error: "No data found" };
      }
  
      try {
        const transformedData = transformDataForGenericChart(data,_,_,metaDataLabels);
        return { chartData: transformedData, error: null };
      } catch (err) {
        return { chartData: [], error: (err as Error).message };
      }
    }, [data]);
  
    if (error || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500 text-lg">{error || "No data available"}</p>
        </div>
      );
    }
  
    const columns = Object.keys(chartData[0]).map((key) => ({
      Header: key.charAt(0).toUpperCase() + key.slice(1),
      accessor: key,
    }));
  
    const [search, setSearch] = useState("");
    const filteredData = useMemo(() => {
      if (!search) return chartData;
      return chartData.filter((row) =>
        columns.some((col) =>
          row[col.accessor]?.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }, [search, chartData]);
  
    const [sortBy, setSortBy] = useState<{ id: string; desc: boolean }[]>([]);
    const sortedData = useMemo(() => {
      if (sortBy.length === 0) return filteredData;
      const { id, desc } = sortBy[0];
      return [...filteredData].sort((a, b) => {
        const aVal = a[id];
        const bVal = b[id];
        if (aVal < bVal) return desc ? 1 : -1;
        if (aVal > bVal) return desc ? -1 : 1;
        return 0;
      });
    }, [filteredData, sortBy]);
  
    const handleSort = (columnId: string) => {
      setSortBy((prevSortBy) => {
        if (prevSortBy.length === 0 || prevSortBy[0].id !== columnId) {
          return [{ id: columnId, desc: false }];
        }
        return [{ id: columnId, desc: !prevSortBy[0].desc }];
      });
    };
  
    return (
      <div style={{ backgroundColor: visualSettings.backgroundColor }}>
        {visualTitleAndSubTitle.visualTitle && (
          <h3 className="text-center text-lg font-bold text-gray-800">
            {visualTitleAndSubTitle.visualTitle}
          </h3>
        )}
        {visualTitleAndSubTitle?.customSubTitle && (
          <h4 className="text-center text-md font-medium text-gray-600 mt-1">
            {visualTitleAndSubTitle?.customSubTitle}
          </h4>
        )}
  
        {/* Search Input */}
        <div className="mb-4">
          <Input
            placeholder="Search in table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      {visualTitleAndSubTitle.visualTitle && <h3 className="text-center text-lg font-bold text-gray-800">{visualTitleAndSubTitle.visualTitle}</h3>}  
                     {visualTitleAndSubTitle?.customSubTitle ?  
                         <h4 className="text-center text-md font-medium text-gray-600 mt-1">{visualTitleAndSubTitle?.customSubTitle}</h4>
                          :   
                               <VisualHeading analyticsPayloadDeterminer={analyticsPayloadDeterminer}  visualTitleAndSubTitle={visualTitleAndSubTitle} />
                     }
        {/* Scrollable Table Section */}
        <div className="max-h-[400px] overflow-auto border rounded-lg">
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    onClick={() => handleSort(column.accessor)}
                    className="cursor-pointer"
                  >
                    {column.Header}
                    {sortBy[0]?.id === column.accessor
                      ? sortBy[0]?.desc
                        ? " 🔽"
                        : " 🔼"
                      : " 🔽"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.accessor}>{row[column.accessor]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    );
  };
