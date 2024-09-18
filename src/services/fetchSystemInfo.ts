import { useConfig } from '@dhis2/app-runtime';
import { useDataQuery } from '@dhis2/app-runtime';

export const useSystemInfo = () => {
    const query = {
        title: {
            resource: 'systemSettings/applicationTitle'
        },
        help: {
            resource: 'systemSettings/helpPageLink'
        },
        user: {
            resource: 'me',
            params: {
                fields: ['authorities', 'avatar', 'email', 'name', 'settings']
            }
        },
        apps: {
            resource: 'action::menu/getModules'
        },
        notifications: {
            resource: 'me/dashboard'
        }
    };

    const { loading, error, data } = useDataQuery(query);
    return { loading, error, data };
};

export const useBaseUrl = () => {
    const { baseUrl } = useConfig();

    return baseUrl;
};