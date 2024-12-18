
/// this function will be used to run analytics API calls during adding or displaying
// visuals items (which are from other sources) on dashboard
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthorities } from '../context/AuthContext';
/// use this if current instance is false

export const useExternalAnalyticsData = () => {

    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to fetch analytics data based on the query, url, and token
    const fetchExternalAnalyticsData = useCallback(async (query: any, token: string, url: string) => {
        setResponse(null);
        setError(null);
        setLoading(true);


        const queryParams = query?.myData?.params

        try {

            // Make the request to the analytics API using the passed URL
            const res = await axios.get(`${url}/api/analytics.json`, {
                headers: {
                    Authorization: `ApiToken ${token}`,
                },
                params:queryParams ,
            });

            setResponse(res.data);


        } catch (err) {
            setError(err.response?.statusText || err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    return { response, error, loading, fetchExternalAnalyticsData };
};
