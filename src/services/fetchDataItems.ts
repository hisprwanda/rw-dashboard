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
    dataItemsDataPage?: number,
    groupsIdOrSubDataItemIds?:string,
    otherOptions?:string
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
       // filterParams.push(`indicatorGroups.id:eq:hHsLXRrRlqU`);
        return {
          indicators: {
            resource: "indicators.json",
            params: { ...commonParams, filter: [  ...filterParams,  ...(groupsIdOrSubDataItemIds ? [`indicatorGroups.id:eq:${groupsIdOrSubDataItemIds}`] : [])]
             },
          },
          indicatorGroups: {
            resource: "indicatorGroups.json",
            params: { ...commonParams, filter: filterParams },
          },
        };
        case "dataElements":
          filterParams.push("domainType:eq:AGGREGATE");
          return {
              ...(otherOptions === "dataElementOperands"
                  ?{
                    dataElementOperands: {
                        resource: "dataElementOperands.json",
                        params: { ...commonParams },
                    },
                }
                  :  {
                    dataElements: {
                        resource: "dataElements.json",
                        params: {
                            ...commonParams,
                            filter: [
                                ...filterParams,
                                ...(groupsIdOrSubDataItemIds
                                    ? [`dataElementGroups.id:eq:${groupsIdOrSubDataItemIds}`]
                                    : []),
                            ],
                        },
                    },
                }
                  ),
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
          }
        };
      case "Event Data Item":
        filterParams.push(
          "dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]"
        );
        return {
          dataItems: {
            resource: "dataItems",
            params: { ...commonParams,filter: [  ...filterParams,  ...(groupsIdOrSubDataItemIds ? [`programId:eq:${groupsIdOrSubDataItemIds}`] : [])] },
          },
          programs: {
            resource: "programs",
            params: { ...commonParams },
          },
        };
      case "Program Indicator":
        filterParams.push("dimensionItemType:eq:PROGRAM_INDICATOR");
        return {
          dataItems: {
            resource: "dataItems",
            params: { ...commonParams, filter:  [  ...filterParams,  ...(groupsIdOrSubDataItemIds ? [`programId:eq:${groupsIdOrSubDataItemIds}`] : [])] },
          },
          programs: {
            resource: "programs",
            params: { ...commonParams },
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
      dataItemsDataPage?: number,
      groupsIdOrSubDataItemIds?:string,
      otherOptions?:string
    ) => {
     
        let subDataItemsDataKey = "";
      const { value } = selectedDimensionItemType;
      const query = buildQuery(value, searchItem, dataItemsDataPage,groupsIdOrSubDataItemIds,otherOptions);

      setLoading(true);
      setError(null);
  

      try {
        const result = await engine.query(query);
  
        let dataKey = [
          "dataItems",
          "Event Data Item",
          "Program Indicator",
          "Calculation",
        ].includes(value)
          ? "dataItems"
          : value;
      
             /// if disaggregation
             if(dataKey === "dataElements" &&  otherOptions === "dataElementOperands")
             {
              dataKey = "dataElementOperands"
             }
        // determine groups key from result results
        switch (dataKey) {
          case "indicators":
            subDataItemsDataKey = "indicatorGroups";
            break;
          case "dataElementOperands":
          case "dataElements":
            subDataItemsDataKey = "dataElementGroups";
            break;
          case "dataItems":
            subDataItemsDataKey = "programs";
            break;
     
          default:
            break;
        }
        console.log("dataKey",dataKey)
        console.log("result",result)
           
        const fetchedData = result[dataKey];
       console.log("fetchedData",fetchedData)
        const groupsAndOtherSubData = result[subDataItemsDataKey];
     

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
