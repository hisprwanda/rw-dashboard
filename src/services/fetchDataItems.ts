import { useState, useCallback } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { useAuthorities } from '../context/AuthContext';
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes';

export const useDataItems = () => {
    const engine = useDataEngine();
    const { setDataItemsData,selectedDimensionItemType } = useAuthorities();
    // Local state for managing loading, error, and data
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // Function to fetch data, only called when explicitly invoked
    const fetchCurrentInstanceData = useCallback(async (selectedDimensionItemType:dimensionItemTypesTYPES) => {
        
        let query:any = {
            dataItems: {
                resource: 'dataItems.json',
                params: {
                    fields: ['id', 'displayName~rename(name)', 'dimensionItemType', 'expression'],
                    order: 'displayName:asc',
                    pageSize: 10000,
                    page: 1,
                },
            },
        };
       if(selectedDimensionItemType.value === "dataElements")
       {
        query = {
            dataElements: {
                resource: 'dataElements.json',
                params: {
                    fields: ['id', 'displayName~rename(name)', 'dimensionItemType', 'expression'],
                    order: 'displayName:asc',
                    pageSize: 10000,
                    page: 1,
                },
            },
        };
       }

        setLoading(true);
        setError(null);
        try {
            const result = await engine.query(query);
            if(selectedDimensionItemType.value === "dataItems"){
                setData(result.dataItems);
                setDataItemsData(result.dataItems);
            }
            else if(selectedDimensionItemType.value === "dataElements")
            {
                setData(result.dataElements);
                setDataItemsData(result.dataElements);
            }

      
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [engine, setDataItemsData]);

    return { loading, error, data, fetchCurrentInstanceData };
};
