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
  fetchAnalyticsData:any
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

  const [analyticsDimensions, setAnalyticsDimensions] = useState<any>({dx:[],pe:['LAST_12_MONTHS'],ou:[]})

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
    const data = await engine.query({
        myData: {
            resource: 'analytics',
            params: {
                dimension
              }
        },
    });
    console.log("analytics returned data",data);
};
  return (
    <AuthContext.Provider value={{ userDatails, authorities,analyticsDimensions, setAnalyticsDimensions,fetchAnalyticsData }}>
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
