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
import { useFetchOrgUnitById ,useOrgUnitData} from "../services/fetchOrgunitData";
import {VisualSettingsTypes,VisualTitleAndSubtitleType,ColorPaletteTypes,visualColorPaletteTypes} from "../types/visualSettingsTypes"
import { systemDefaultColorPalettes } from "../constants/colorPalettes";



interface AuthContextProps {
  userDatails: {};
  authorities: string[];
  analyticsDimensions: any;
  setAnalyticsDimensions: any;
  fetchAnalyticsData: any;
  analyticsData: any;
  setAnalyticsData:any;
  isFetchAnalyticsDataLoading: any;
  fetchAnalyticsDataError: any;
  setSelectedOrganizationUnits: any;
  selectedOrganizationUnits: any;
  isUseCurrentUserOrgUnits: boolean;
  setIsUseCurrentUserOrgUnits: any;
  selectedOrganizationUnitsLevels: any;
  setSelectedOrganizationUnitsLevels: any;
  selectedOrgUnitGroups: any;
  setSelectedOrgUnitGroups: any;
  isSetPredifinedUserOrgUnits: any;
  setIsSetPredifinedUserOrgUnits: any;
  selectedLevel: any;
  setSelectedLevel: any;
  selectedOrgUnits: any;
  setSelectedOrgUnits: any;
  analyticsQuery:any;
  selectedChartType:string,
   setSelectedChartType:any,
   setAnalyticsQuery:any;
   selectedVisualsForDashboard:string[];
   setSelectedVisualsForDashboard:any;
   visualTitleAndSubTitle: VisualTitleAndSubtitleType;
    setSelectedVisualTitleAndSubTitle:any;
    fetchSingleOrgUnitName:any;
    visualSettings:VisualSettingsTypes;
    setSelectedVisualSettings:any;
   selectedColorPalette:visualColorPaletteTypes;
    setSelectedColorPalette :any;
    visualsColorPalettes:ColorPaletteTypes;
    setVisualsColorPalettes:any;
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

 // const currentUserOrgUnitId = userDatails?.me?.organisationUnits?.[0]?.id || "Hjw70Lodtf2";

  const {data:currentUserOrgData} = useOrgUnitData()
  const defaultUserOrgUnit = currentUserOrgData?.currentUser?.organisationUnits?.[0]?.displayName

  const [isFetchAnalyticsDataLoading, setIsFetchAnalyticsDataLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [fetchAnalyticsDataError, setFetchAnalyticsDataError] = useState<any>(false);
  const [analyticsDimensions, setAnalyticsDimensions] = useState<any>({ dx: [], pe: ['LAST_12_MONTHS'] });
  const [selectedOrganizationUnits, setSelectedOrganizationUnits] = useState<any>([]);
  const [selectedOrganizationUnitsLevels, setSelectedOrganizationUnitsLevels] = useState<any>([]);
  const [isUseCurrentUserOrgUnits, setIsUseCurrentUserOrgUnits] = useState<boolean>(true);
  const [selectedOrgUnitGroups, setSelectedOrgUnitGroups] = useState<any>([]);
  const [selectedLevel, setSelectedLevel] = useState<any>();
  const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
  const [analyticsQuery, setAnalyticsQuery] = useState<any>(null)
  const [selectedChartType, setSelectedChartType] = useState<any>(""); 
  const [selectedVisualsForDashboard, setSelectedVisualsForDashboard] = useState<string[]>([]);
  const [visualTitleAndSubTitle, setSelectedVisualTitleAndSubTitle] = useState<VisualTitleAndSubtitleType>({
    visualTitle: "",
    DefaultSubTitle: [defaultUserOrgUnit],
    customSubTitle:""
  })


 const [selectedColorPalette, setSelectedColorPalette] = useState<visualColorPaletteTypes>(systemDefaultColorPalettes[0] || []);
 
 const [visualsColorPalettes,setVisualsColorPalettes] =useState<ColorPaletteTypes >(systemDefaultColorPalettes)
  const [visualSettings, setSelectedVisualSettings] = useState<VisualSettingsTypes>({visualColorPalette:selectedColorPalette})


  const [isSetPredifinedUserOrgUnits, setIsSetPredifinedUserOrgUnits] = useState<any>({
    is_USER_ORGUNIT: true,
    is_USER_ORGUNIT_CHILDREN: false,
    is_USER_ORGUNIT_GRANDCHILDREN: false
  });


   

  useEffect(() => {
    if (data) {
      setUserDatails(data);
      setAuthorities(data.me.authorities);
    }
  }, [data]);

  // test
  useEffect(()=>{
       if(currentUserOrgData?.currentUser?.organisationUnits?.[0]?.displayName)
       {
      setSelectedVisualTitleAndSubTitle({
          visualTitle:"",
          DefaultSubTitle: [currentUserOrgData?.currentUser?.organisationUnits?.[0]?.displayName],
          customSubTitle:""
        })

       }
  },[currentUserOrgData || []])

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading user authorities</div>;



  // testing
  const engine = useDataEngine();
  const fetchAnalyticsData = async (dimension: any) => {
    try {
      setIsFetchAnalyticsDataLoading(true);
      setFetchAnalyticsDataError(false);
      const orgUnitIds = selectedOrganizationUnits?.map((unit: any) => unit).join(';');
      const orgUnitLevelIds = selectedOrganizationUnitsLevels?.map((unit: any) => `LEVEL-${unit}`).join(';');
      const orgUnitGroupIds = selectedOrgUnitGroups?.map((item: any) => `OU_GROUP-${item}`).join(';');

      console.log({ orgUnitGroupIds, orgUnitIds, orgUnitLevelIds });

      const analyticsQuery = {
        myData: {
          resource: 'analytics',
          params: {
            dimension,
            // if current org unit is checked use keyword, if not use other org units
            filter: `ou:${isUseCurrentUserOrgUnits
              ? `${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT ? 'USER_ORGUNIT;' : ''}${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_CHILDREN ? 'USER_ORGUNIT_CHILDREN;' : ''}${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_GRANDCHILDREN ? 'USER_ORGUNIT_GRANDCHILDREN;' : ''}`.slice(0, -1)
              : `${orgUnitIds};${orgUnitLevelIds};${orgUnitGroupIds}`
              }`,
            displayProperty: 'NAME',
            includeNumDen: true,
            // skipMeta: false,
            // skipData: true,
            // includeMetadataDetails: true
          }
        },
      }

      const result = await engine.query(analyticsQuery);
      setAnalyticsData(result?.myData);
      // set analytics query
      setAnalyticsQuery(analyticsQuery)
    } catch (error) {
      // temporally commented
     // setFetchAnalyticsDataError(error);
      console.log("Error fetching analytics data:", error);
    
    } finally {
      setIsFetchAnalyticsDataLoading(false);
    }



  };



  const fetchSingleOrgUnitName = async(orgUnitId:string)=>{
    try {
      const query = {
        organisationUnit: {
          resource: `organisationUnits/${orgUnitId}`,
          params: {
            fields: 'displayName',
          },
        
        },
      };

      const result = await engine.query(query);
     // console.log("single org unit name", result)
      return result.organisationUnit.displayName
      // update state here with result


    
    } catch (error) {
      console.log("fetch single org err",error)
    }
  }

 
  return (
    <AuthContext.Provider value={{setVisualsColorPalettes,visualsColorPalettes, selectedColorPalette,setSelectedColorPalette ,visualSettings,setSelectedVisualSettings,fetchSingleOrgUnitName,visualTitleAndSubTitle,setSelectedVisualTitleAndSubTitle,  selectedVisualsForDashboard, setSelectedVisualsForDashboard,setAnalyticsData,setAnalyticsQuery,selectedOrgUnits, setSelectedOrgUnits, selectedLevel, setSelectedLevel, userDatails, authorities, analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, analyticsData, isFetchAnalyticsDataLoading, fetchAnalyticsDataError, setSelectedOrganizationUnits, selectedOrganizationUnits, isUseCurrentUserOrgUnits, setIsUseCurrentUserOrgUnits, selectedOrganizationUnitsLevels, setSelectedOrganizationUnitsLevels, selectedOrgUnitGroups, setSelectedOrgUnitGroups, isSetPredifinedUserOrgUnits, setIsSetPredifinedUserOrgUnits ,analyticsQuery,selectedChartType,setSelectedChartType}}>
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
