// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { useDataEngine } from '@dhis2/app-runtime';

interface AuthContextProps {
  userDatails: {};
  authorities: string[];
  analyticsDimensions:any;
  setAnalyticsDimensions:any;
  fetchAnalyticsData:any;
  analyticsData:any;
  isFetchAnalyticsDataLoading:any;
  fetchAnalyticsDataError:any;
  setSelectedOrganizationUnits:any;
  selectedOrganizationUnits:any;
  isUseCurrentUserOrgUnits:boolean;
   setIsUseCurrentUserOrgUnits:any;
   selectedOrganizationUnitsLevels:any;
   setSelectedOrganizationUnitsLevels:any;
   selectedOrgUnitGroups:any;
   setSelectedOrgUnitGroups:any;
   isSetPredifinedUserOrgUnits:any;
   setIsSetPredifinedUserOrgUnits:any

}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const query = {
  me: {
    resource: "me",
    // params: {
    //   fields: ["authorities"],
    // },
  },
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data, loading, error } = useDataQuery(query);


  const [authorities, setAuthorities] = useState<string[]>([]);
  const [userDatails, setUserDatails] = useState<{}>({});
  const [isFetchAnalyticsDataLoading, setIsFetchAnalyticsDataLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [fetchAnalyticsDataError, setFetchAnalyticsDataError] = useState<any>(false)
  const [analyticsDimensions, setAnalyticsDimensions] = useState<any>({dx:[],pe:['LAST_12_MONTHS']})
  const [selectedOrganizationUnits,setSelectedOrganizationUnits] = useState<any>([])
  const [selectedOrganizationUnitsLevels,setSelectedOrganizationUnitsLevels] = useState<any>([])
  const [isUseCurrentUserOrgUnits, setIsUseCurrentUserOrgUnits] = useState<boolean>(true)
  const [selectedOrgUnitGroups, setSelectedOrgUnitGroups] = useState<any>([]);

  const [isSetPredifinedUserOrgUnits,setIsSetPredifinedUserOrgUnits] = useState<any>({
    is_USER_ORGUNIT:true,
    is_USER_ORGUNIT_CHILDREN:false,
    is_USER_ORGUNIT_GRANDCHILDREN:false
  })

  const USER_ORGUNIT = 'USER_ORGUNIT';
  const USER_ORGUNIT_CHILDREN = "USER_ORGUNIT_CHILDREN" 
   const USER_ORGUNIT_GRANDCHILDREN = "USER_ORGUNIT_GRANDCHILDREN"

  
  useEffect(()=>{
    console.log("curren stat",isUseCurrentUserOrgUnits)
  },[isUseCurrentUserOrgUnits])

  useEffect(() => {
    if (data) {
      setUserDatails(data);
      setAuthorities(data.me.authorities);
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading user authorities</div>;

  // testing
  const engine = useDataEngine();
  const fetchAnalyticsData = async (dimension:any) => {
   try {
    setIsFetchAnalyticsDataLoading(true)
    setFetchAnalyticsDataError(false)
    const orgUnitIds = selectedOrganizationUnits?.map((unit:any) => unit).join(';');
    const orgUnitLevelIds = selectedOrganizationUnitsLevels?.map((unit:any) => `LEVEL-${unit}`).join(';');
    const orgUnitGroupIds = selectedOrgUnitGroups?.map((item:any) => `OU_GROUP-${item}`).join(';');
    console.log({orgUnitGroupIds,orgUnitIds,orgUnitLevelIds})
     const result = await engine.query({
      myData: {
          resource: 'analytics',
          params: {
              dimension,
              // if current org unit is checked use keyword, if not use other org units
               filter:`ou:${
  isUseCurrentUserOrgUnits
    ? `${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT ? 'USER_ORGUNIT;' : ''}${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_CHILDREN ? 'USER_ORGUNIT_CHILDREN;' : ''}${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_GRANDCHILDREN ? 'USER_ORGUNIT_GRANDCHILDREN;' : ''}`.slice(0, -1)
    : `${orgUnitIds};${orgUnitLevelIds};${orgUnitGroupIds}`
}`,
              displayProperty: 'NAME',        
              includeNumDen: true,            
              skipMeta: false,               
              skipData: true,               
              includeMetadataDetails: true 
            }
      },
     });
   setAnalyticsData(result?.myData)
   } catch (error) {
    setFetchAnalyticsDataError(true)
    console.log("error fetching analytics data",error)
   }finally{
    setIsFetchAnalyticsDataLoading(false)
   }


 
};
  return (
    <AuthContext.Provider value={{  userDatails, authorities,analyticsDimensions, setAnalyticsDimensions,fetchAnalyticsData ,analyticsData,isFetchAnalyticsDataLoading,fetchAnalyticsDataError,setSelectedOrganizationUnits,selectedOrganizationUnits,isUseCurrentUserOrgUnits, setIsUseCurrentUserOrgUnits,selectedOrganizationUnitsLevels,setSelectedOrganizationUnitsLevels,selectedOrgUnitGroups,setSelectedOrgUnitGroups, isSetPredifinedUserOrgUnits,setIsSetPredifinedUserOrgUnits}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthorities = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthorities must be used within a AuthProvider");
  }
  return context;
};
