import { useState, useCallback } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { useAuthorities } from '../context/AuthContext';
import { analyticsPayloadDeterminerTypes } from '../types/analyticsTypes';
import { updateQueryParams } from '../lib/payloadFormatter';
/// use this if current instance is true
export const useFetchSingleChartApi = (query: any,analyticsPayloadDeterminer:analyticsPayloadDeterminerTypes) => {

    if (!query) {

        return { data: null, loading: false, error: "Invalid query", isError: true, refetch: null };
    }
    const engine = useDataEngine();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const updateParams = updateQueryParams(query?.myData?.params,analyticsPayloadDeterminer)
    const updatedQuery = {
        ...query,
        myData: {
          ...query.myData,
          params: updateParams
        }
      }
    // Function to fetch data, only called when explicitly invoked
    const runSavedSingleVisualAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
     
            const result = await engine.query(updatedQuery);
        
            setData(result?.myData);
        } catch (err) {
            setError(err); // Ensure the error is handled correctly
        } finally {
            setLoading(false);
        }
    }, [engine, query]);
    
    return { data, loading, error, runSavedSingleVisualAnalytics };
};
