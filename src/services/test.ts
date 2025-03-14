import { useDataQuery } from '@dhis2/app-runtime';

const query = {
    analytics: {
        resource: 'analytics.json',
        params: {
            dimension: [
                'dx:Tt5TAvdfdVK',
                'ou:ImspTQPwCqd;LEVEL-2'
            ],
            filter: 'pe:2024',
            displayProperty: 'NAME',
            skipData: false,
            skipMeta: true,
        },
    },
};

export const useTestOnlineAnalyticsData = () => {
    const { data, error, loading, refetch } = useDataQuery(query);
    return { data, error, loading, refetch };
};


const queryTwo = {
    analytics: {
        resource: 'analytics.json',
        params: {
            dimension: [
                'dx:Tt5TAvdfdVK',
                'pe:2024'
            ],
            filter: 'ou:ImspTQPwCqd;LEVEL-2',
            displayProperty: 'NAME',
            skipData: false,
            skipMeta: true,
        },
    },
};

export const useLocalAnalyticsData = () => {
    const { data, error, loading, refetch } = useDataQuery(queryTwo);
    return { data, error, loading, refetch };
};
