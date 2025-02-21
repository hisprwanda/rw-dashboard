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
import {  useOrgUnitData} from "../services/fetchOrgunitData";
import {VisualSettingsTypes,VisualTitleAndSubtitleType,ColorPaletteTypes,visualColorPaletteTypes, AxisSettingsTypes} from "../types/visualSettingsTypes"
import { systemDefaultColorPalettes } from "../constants/colorPalettes";
import { DataSourceFormFields } from "../types/DataSource";
import { useSystemInfo } from "../services/fetchSystemInfo";
import axios from "axios";
import { dimensionItemTypesTYPES } from "../types/dimensionDataItemTypes";
import { dimensionItemTypes } from "../constants/dimensionItemTypes";
import { BackedSelectedItem, visualTypes } from "../types/visualType";



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
  selectedChartType:visualTypes,
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
    dataItemsData:any;
    setDataItemsData:any;
    selectedDataSourceDetails:DataSourceFormFields;
     setSelectedDataSourceDetails:any;
     currentUserInfoAndOrgUnitsData:any;
     setCurrentUserInfoAndOrgUnitsData:any;
     selectedDataSourceOption:string;
      setSelectedDataSourceOption:any;
      selectedDimensionItemType:dimensionItemTypesTYPES;
       setSelectedDimensionItemType:any;
       dataItemsDataPage:number;
        setDataItemsDataPage:any;
        subDataItemsData:any;
        setSubDataItemsData:any;
        backedSelectedItems:BackedSelectedItem[] ;
         setBackedSelectedItems:any;
         isExportingDashboardAsPPTX:boolean;
          setIsExportingDashboardAsPPTX:any
 
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
  const [isExportingDashboardAsPPTX, setIsExportingDashboardAsPPTX] = useState<boolean>(false);
  const {  data:systemInfo } = useSystemInfo();
  const [authorities, setAuthorities] = useState<string[]>([]);
  const [userDatails, setUserDatails] = useState<{}>({});
 const [selectedDataSourceOption, setSelectedDataSourceOption] = useState<string>("");
  /// this is the current instance definition as data source
  const defaultDataSource: DataSourceFormFields = {
    instanceName: systemInfo?.title?.applicationTitle || "", // Fallback to an empty string if undefined
    isCurrentInstance: true,
  };
  
  const [selectedDataSourceDetails, setSelectedDataSourceDetails] = useState<DataSourceFormFields>(defaultDataSource);

    const [selectedDimensionItemType, setSelectedDimensionItemType] = useState<dimensionItemTypesTYPES>(dimensionItemTypes[0])

  // metadata states
  // 
  const [dataItemsData,setDataItemsData] = useState<any>()
  const [subDataItemsData,setSubDataItemsData] = useState<any>()
  const [dataItemsDataPage, setDataItemsDataPage] = useState<number>(1);
 const [currentUserInfoAndOrgUnitsData, setCurrentUserInfoAndOrgUnitsData] = useState<any>()
 // const currentUserOrgUnitId = userDatails?.me?.organisationUnits?.[0]?.id || "Hjw70Lodtf2";
  const [backedSelectedItems, setBackedSelectedItems] = useState<BackedSelectedItem[]>([]);
  

  const defaultUserOrgUnit = currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName
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
  const [selectedChartType, setSelectedChartType] = useState<visualTypes>("Column"); 
  const [selectedVisualsForDashboard, setSelectedVisualsForDashboard] = useState<string[]>([]);
  const [visualTitleAndSubTitle, setSelectedVisualTitleAndSubTitle] = useState<VisualTitleAndSubtitleType>({
    visualTitle: "",
    DefaultSubTitle: [defaultUserOrgUnit],
    customSubTitle:""
  })

  useEffect(()=>{
    console.log("track selectedOrganizationUnits",selectedOrganizationUnits)
  },[selectedOrganizationUnits])
 const [selectedColorPalette, setSelectedColorPalette] = useState<visualColorPaletteTypes>(systemDefaultColorPalettes[0] || []);

 const [visualsColorPalettes,setVisualsColorPalettes] =useState<ColorPaletteTypes >(systemDefaultColorPalettes)
  const [visualSettings, setSelectedVisualSettings] = useState<VisualSettingsTypes>({ backgroundColor: '#ffffff',visualColorPalette:selectedColorPalette,fillColor:"#ffffff",XAxisSettings:{color:"#000000",fontSize:12},YAxisSettings:{color:"#000000",fontSize:12} })


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

       if(currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName)
       {
      setSelectedVisualTitleAndSubTitle({
          visualTitle:"",
          DefaultSubTitle: [currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName],
          customSubTitle:""
        })

       }
  },[currentUserInfoAndOrgUnitsData || []])

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading user authorities</div>;



  // testing
  const engine = useDataEngine();
  const fetchAnalyticsData = async (dimension: any,instance:DataSourceFormFields ) => {
    console.log("here is the selected instance",instance)
    console.log("here is the selected dimension",dimension)
    const orgUnitIds = selectedOrganizationUnits?.map((unit: any) => unit).join(';');
    const orgUnitLevelIds = selectedOrganizationUnitsLevels?.map((unit: any) => `LEVEL-${unit}`).join(';');
    const orgUnitGroupIds = selectedOrgUnitGroups?.map((item: any) => `OU_GROUP-${item}`).join(';');

    const filter = `ou:${isUseCurrentUserOrgUnits
      ? `${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT ? 'USER_ORGUNIT;' : ''}${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_CHILDREN ? 'USER_ORGUNIT_CHILDREN;' : ''}${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_GRANDCHILDREN ? 'USER_ORGUNIT_GRANDCHILDREN;' : ''}`.slice(0, -1)
      : `${orgUnitIds};${orgUnitLevelIds};${orgUnitGroupIds}`}`;

    if (
      dimension.some(item => item.startsWith("dx:") && item.split(":")[1].trim()) &&
      dimension.some(item => item.startsWith("pe:") && item.split(":")[1].trim()) &&
      filter.startsWith("ou:") && filter.split(":")[1].trim()
  ){
    try {
      setIsFetchAnalyticsDataLoading(true);
      setFetchAnalyticsDataError(null);

 
      const queryParams = {
        dimension,
        filter,
        displayProperty: 'NAME',
        includeNumDen: true,
      };

      

      if (instance.isCurrentInstance) {
        // Internal request via engine.query
        const analyticsQuery = {
          myData: {
            resource: 'analytics',
            params: queryParams,
          },
        };

        const result = await engine.query(analyticsQuery);
        setAnalyticsData(result?.myData);
        setAnalyticsQuery(analyticsQuery);
      } else {
        // External request via axios

        console.log("beta query",queryParams)
        const response = await axios.get(`${instance.url}/api/40/analytics`, {
          headers: {
            Authorization: `ApiToken ${instance.token}`,
          },
          params: queryParams,
        });

        setAnalyticsData(response.data);
        setAnalyticsQuery({ myData: { resource: 'analytics', params: queryParams } });
      }
    } catch (error) {
      setFetchAnalyticsDataError(error);
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsFetchAnalyticsDataLoading(false);
    }
  }




  };

  const fetchSingleOrgUnitName = async (orgUnitId: string, instance: DataSourceFormFields) => {
    try {
      if (instance.isCurrentInstance) {
        // Internal request via engine.query
        const query = {
          organisationUnit: {
            resource: `organisationUnits/${orgUnitId}`,
            params: {
              fields: 'displayName',
            },
          },
        };
        const result = await engine.query(query);
        return result.organisationUnit.displayName;
      } else {
        // External request via axios
        const response = await axios.get(
          `${instance.url}/api/40/organisationUnits/${orgUnitId}`,
          {
            headers: {
              Authorization: `ApiToken ${instance.token}`,
            },
            params: {
              fields: 'displayName',
            },
          }
        );
        return response.data.displayName;
      }
    } catch (error) {
      console.log("fetch single org err", error);
      throw error; // Re-throwing error to handle it in the calling function
    }
  };





  return (
    <AuthContext.Provider value={{isExportingDashboardAsPPTX,setIsExportingDashboardAsPPTX,setSubDataItemsData,subDataItemsData,backedSelectedItems,setBackedSelectedItems,dataItemsDataPage,setDataItemsDataPage,selectedDimensionItemType,setSelectedDimensionItemType,selectedDataSourceOption,setSelectedDataSourceOption,currentUserInfoAndOrgUnitsData,setCurrentUserInfoAndOrgUnitsData,selectedDataSourceDetails,setSelectedDataSourceDetails,dataItemsData,setDataItemsData,setVisualsColorPalettes,visualsColorPalettes, selectedColorPalette,setSelectedColorPalette ,visualSettings,setSelectedVisualSettings,fetchSingleOrgUnitName,visualTitleAndSubTitle,setSelectedVisualTitleAndSubTitle,  selectedVisualsForDashboard, setSelectedVisualsForDashboard,setAnalyticsData,setAnalyticsQuery,selectedOrgUnits, setSelectedOrgUnits, selectedLevel, setSelectedLevel, userDatails, authorities, analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, analyticsData, isFetchAnalyticsDataLoading, fetchAnalyticsDataError, setSelectedOrganizationUnits, selectedOrganizationUnits, isUseCurrentUserOrgUnits, setIsUseCurrentUserOrgUnits, selectedOrganizationUnitsLevels, setSelectedOrganizationUnitsLevels, selectedOrgUnitGroups, setSelectedOrgUnitGroups, isSetPredifinedUserOrgUnits, setIsSetPredifinedUserOrgUnits ,analyticsQuery,selectedChartType,setSelectedChartType}}>
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
