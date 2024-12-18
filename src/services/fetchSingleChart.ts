import { useState, useCallback } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { useAuthorities } from '../context/AuthContext';
/// use this if current instance is true
export const useFetchSingleChartApi = (query: any) => {

  
    if (!query) {

        return { data: null, loading: false, error: "Invalid query", isError: true, refetch: null };
    }
   const {resultOfSavedSingleVisual,setResultOfSavedSingleVisual} =  useAuthorities()
    const engine = useDataEngine();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // Function to fetch data, only called when explicitly invoked
    const runSavedSingleVisualAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setResultOfSavedSingleVisual(null); // Clear previous data
            const result = await engine.query(query);
            setResultOfSavedSingleVisual(result?.myData); // Save fetched result
            setData(result?.myData);
        } catch (err) {
            setError(err); // Ensure the error is handled correctly
        } finally {
            setLoading(false);
        }
    }, [engine, query]);
    
    return { data, loading, error, runSavedSingleVisualAnalytics };
};
