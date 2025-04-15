import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';
import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from 'react';

export const useLegendsData = ()=>{
const query = {
  results: {
    resource: 'legendSets'
  }
};
  const { data, loading, error ,isError,refetch} = useDataQuery(query);
  const myLegendSets = data?.results?.legendSets
  return { myLegendSets, loading, error,isError,refetch };

}


export const useFetchSingleLegend = () => {
    const engine = useDataEngine();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const fetchSingleLegendById = async ({ id }: { id: string }) => {
        setIsLoading(true);
        setIsError(false);
        try {
            const response = await engine.query({
                legend: {
                    resource: `legendSets/${id}`,
                    params: {
                        fields: 'legends[name,startValue,endValue,color]'
                    }
                }
            });

            setData(response.legend?.legends);
            return response.legend.legends;
        } catch (error) {
            setIsError(true);
            console.error("fetch single legend failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, data, isError, fetchSingleLegendById };
};