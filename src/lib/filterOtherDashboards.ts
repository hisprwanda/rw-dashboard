interface User {
    id: string;
    name: string;
  }
  
  interface SharingAccess {
    accessLevel: string;
    id: string;
    name: string;
    type: string;
  }
  interface VisualQuery {
    myData: {
      params: {
        filter: string;
        dimension: string[];
        includeNumDen: boolean;
        displayProperty: string;
      };
      resource: string;
    };
  }
  
  interface SelectedVisual {
    h: number;
    i: string;
    w: number;
    x: number;
    y: number;
    visualName: string;
    visualType: string;
    visualQuery: VisualQuery;
  }
  
  interface DashboardValue {
    generalDashboardAccess: "No access" | "View only" | "View and edit";
    sharing: SharingAccess[];
    createdAt: number;
    createdBy: User;
    updatedAt: number;
    updatedBy: User;
    dashboardName: string;
    dashboardDescription: string;
    selectedVisuals: SelectedVisual[];
    isOfficialDashboard:boolean;
    previewImg:string,
    favorites: any[];
  }
  
  interface DashboardData {
    key: string;
    value: DashboardValue;
  }
  
export const filterOtherCharts = (
  data: DashboardData[] | undefined,
  creatorId: string | undefined
): DashboardData[] => {
  if (!data || !creatorId) return [];

  return data.filter((item) => {
    // First condition: Skip if user is the creator
    if (item.value.createdBy.id === creatorId) {
      return false;
    }

    // Check if generalDashboardAccess is "View only" or "View and edit"
    const hasGeneralAccess = ["View only", "View and edit"].includes(
      item.value.generalDashboardAccess
    );

    // Check if user is in sharing array
    const isUserInSharingList = item.value.sharing.some(
      (share) => share.id === creatorId
    );

    // Logic combinations:
    // 1. If generalDashboardAccess is "View only" or "View and edit" -> Allow access
    // 2. If generalDashboardAccess is "No access" but user is in sharing list -> Allow access
    // 3. If generalDashboardAccess is "No access" and user is not in sharing list -> Deny access
    return hasGeneralAccess || isUserInSharingList;
  });
};