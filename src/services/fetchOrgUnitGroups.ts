import { useDataQuery } from '@dhis2/app-runtime';


export const useSingleOrgUnitGroupsData = () => {
  const query = {
    organisationUnitGroups: {
      resource: 'organisationUnitGroups',
      params: {
        fields: [
          'id',
          'displayName~rename(displayName)',  // Renaming 'displayName' to 'displayName'
          'name'
        ],
        paging: false // Disable paging
      }
    }
  };
    const { loading, error, data } = useDataQuery(query);
    return { loading, error, data };
  };