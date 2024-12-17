import { useState, useCallback } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { useAuthorities } from '../context/AuthContext';

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
        setResultOfSavedSingleVisual(null)
          const result = await engine.query(query);
          console.log("hello friday!",result);
          setResultOfSavedSingleVisual(result)
          setData(result);
         
      } catch (err) {
          setError(err);
      } finally {
          setLoading(false);
      }
  }, [engine, query]);
    return { data, loading, error, runSavedSingleVisualAnalytics };
};
