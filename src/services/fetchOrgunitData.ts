import { useDataQuery } from '@dhis2/app-runtime'
import { useState, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'

// This service is responsible for fetching the current user and organization units
export const useOrgUnitData = () => {
    const engine = useDataEngine()
    // Local states for loading, error, and data
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    const query = {
        currentUser: {
            resource: 'me',
            params: {
                fields: ['organisationUnits[id, displayName]'],
            },
        },
        orgUnits: {
            resource: 'organisationUnits',
            params: {
                fields: 'id,displayName,path,children[id,displayName,path,level],level',
                paging: 'false',
            },
        },
        orgUnitLevels: {
            resource: 'organisationUnitLevels',
            params: {
                fields: 'id,displayName,level',
                paging: 'false',
            },
        },
        orgUnitGroups: {
            resource: 'organisationUnitGroups',
            params: {
                fields: 'id,displayName,organisationUnits[id,displayName]',
                paging: 'false',
            },
        },
    }

    // Function to explicitly fetch data
    const fetchCurrentUserInfoAndOrgUnitData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await engine.query(query)
            setData(result) // Store the fetched data in state
            return result
        } catch (err) {
            setError(err) // Handle any errors
            return null // Explicitly return null or some default value
        } finally {
            setLoading(false) // Reset the loading state
        }
    }, [engine, query])

    return { loading, error, data, fetchCurrentUserInfoAndOrgUnitData }
}

// export const useFetchOrgUnitById = (orgUnitId:string | null) => {

//   const query = {
//     organisationUnit: {
//       resource: `organisationUnits/${orgUnitId}`,
//       params: {
//         fields: 'displayName',
//       },

//     },
//   };

//   return { data, loading, error, isError };
// };
