import { useState, useCallback } from "react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useAuthorities } from "../context/AuthContext";
import { dimensionItemTypesTYPES } from "../types/dimensionDataItemTypes";

export const useDataItems = () => {
  const engine = useDataEngine();
  const {
    setDataItemsData,
    selectedDimensionItemType,
    setSubDataItemsData,
    subDataItemsData,
  } = useAuthorities();

  // Local state for managing loading, error, and data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Helper function to build the query based on dimension type and search item
  const buildQuery = (
    dimensionType: string,
    searchItem?: string,
    dataItemsDataPage?: number
  ) => {
    const commonParams = {
      fields: [
        "id",
        "displayName~rename(name)",
        "dimensionItemType",
        "expression",
      ],
      order: "displayName:asc",
      pageSize: 50,
      page: dataItemsDataPage,
      paging: true,
    };

    // Add dynamic filter for searchItem
    const filterParams = [];
    if (searchItem) {
      filterParams.push(`displayName:ilike:${searchItem}`);
    }

    switch (dimensionType) {
      case "dataItems":
        return {
          dataItems: {
            resource: "dataItems.json",
            params: { ...commonParams, filter: filterParams },
          },
        };
      case "indicators":
        return {
          indicators: {
            resource: "indicators.json",
            params: { ...commonParams, filter: filterParams },
          },
          indicatorGroups: {
            resource: "indicatorGroups.json",
            params: { ...commonParams, filter: filterParams },
          },
        };
      case "dataElements":
        filterParams.push("domainType:eq:AGGREGATE");
        return {
          dataElements: {
            resource: "dataElements.json",
            params: { ...commonParams, filter: filterParams },
          },
          dataElementGroups: {
            resource: "dataElementGroups.json",
            params: { ...commonParams },
          },
        };
      case "dataSets":
        return {
          dataSets: {
            resource: "dataSets.json",
            params: { ...commonParams, filter: filterParams },
          },
        };
      case "Event Data Item":
        filterParams.push(
          "dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]"
        );
        return {
          dataItems: {
            resource: "dataItems",
            params: { ...commonParams, filter: filterParams },
          },
        };
      case "Program Indicator":
        filterParams.push("dimensionItemType:eq:PROGRAM_INDICATOR");
        return {
          dataItems: {
            resource: "dataItems",
            params: { ...commonParams, filter: filterParams },
          },
        };
      case "Calculation":
        filterParams.push("dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM");
        return {
          dataItems: {
            resource: "dataItems",
            params: { ...commonParams, filter: filterParams },
          },
        };
      default:
        return {};
    }
  };

  // Function to fetch data, explicitly invoked with a search term
  const fetchCurrentInstanceData = useCallback(
    async (
      selectedDimensionItemType: dimensionItemTypesTYPES,
      searchItem?: string,
      dataItemsDataPage?: number
    ) => {
      const { value } = selectedDimensionItemType;
      const query = buildQuery(value, searchItem, dataItemsDataPage);

      setLoading(true);
      setError(null);

      try {
        const result = await engine.query(query);
        console.log("hello hello result before", result);
        const dataKey = [
          "dataItems",
          "Event Data Item",
          "Program Indicator",
          "Calculation",
        ].includes(value)
          ? "dataItems"
          : value;

        let subDataItemsDataKey = "indicatorGroups";
        // determine groups key from result results
        switch (dataKey) {
          case "indicators":
            subDataItemsDataKey = "indicatorGroups";
            break;
          case "dataElements":
            subDataItemsDataKey = "dataElementGroups";
            break;
          default:
            break;
        }

        const fetchedData = result[dataKey];

        const groupsAndOtherSubData = result[subDataItemsDataKey];
        console.log("groupsAndOtherSubData", groupsAndOtherSubData);

        setData(fetchedData);
        setDataItemsData(fetchedData);
        setSubDataItemsData(groupsAndOtherSubData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [engine, setDataItemsData, setSubDataItemsData]
  );

  return { loading, error, data, fetchCurrentInstanceData };
};
