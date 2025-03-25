type FilterParams = {
  isAnalyticsApiUsedInMap?: boolean;
  selectedPeriodsOnMap?: string[];
  isUseCurrentUserOrgUnits?: boolean;
  isSetPredifinedUserOrgUnits?: {
    is_USER_ORGUNIT: boolean;
    is_USER_ORGUNIT_CHILDREN: boolean;
    is_USER_ORGUNIT_GRANDCHILDREN: boolean;
  };
  orgUnitIds?: string;
  orgUnitLevelIds?: string;
  orgUnitGroupIds?: string;
};

export const getAnalyticsFilter = ({
  isAnalyticsApiUsedInMap = false,
  selectedPeriodsOnMap = [],
  isUseCurrentUserOrgUnits = false,
  isSetPredifinedUserOrgUnits = {
    is_USER_ORGUNIT: false,
    is_USER_ORGUNIT_CHILDREN: false,
    is_USER_ORGUNIT_GRANDCHILDREN: false,
  },
  orgUnitIds = "",
  orgUnitLevelIds = "",
  orgUnitGroupIds = "",
}: FilterParams = {}): string => {
  if (isAnalyticsApiUsedInMap) {
    return selectedPeriodsOnMap.join(";");
  }

  if (isUseCurrentUserOrgUnits) {
    const userOrgUnits = [
      isSetPredifinedUserOrgUnits.is_USER_ORGUNIT ? "USER_ORGUNIT" : "",
      isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_CHILDREN
        ? "USER_ORGUNIT_CHILDREN"
        : "",
      isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_GRANDCHILDREN
        ? "USER_ORGUNIT_GRANDCHILDREN"
        : "",
    ]
      .filter(Boolean)
      .join(";");

    return `ou:${userOrgUnits}`;
  }

  return `ou:${orgUnitIds};${orgUnitLevelIds};${orgUnitGroupIds}`;
};




type OrgUnitParams = {
    isUseCurrentUserOrgUnits: boolean;
    isSetPredifinedUserOrgUnits: {
      is_USER_ORGUNIT: boolean;
      is_USER_ORGUNIT_CHILDREN: boolean;
      is_USER_ORGUNIT_GRANDCHILDREN: boolean;
    };
    orgUnitIds: string;
    orgUnitLevelIds: string;
    orgUnitGroupIds: string;
  };
  
 export const getSelectedOrgUnitsWhenUsingMap = (params: OrgUnitParams): string => {
    const { 
      isUseCurrentUserOrgUnits, 
      isSetPredifinedUserOrgUnits, 
      orgUnitIds, 
      orgUnitLevelIds, 
      orgUnitGroupIds 
    } = params;
  
    if (isUseCurrentUserOrgUnits) {
      const userOrgUnits = [
        isSetPredifinedUserOrgUnits.is_USER_ORGUNIT ? 'USER_ORGUNIT' : '',
        isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_CHILDREN ? 'USER_ORGUNIT_CHILDREN' : '',
        isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_GRANDCHILDREN ? 'USER_ORGUNIT_GRANDCHILDREN' : '',
      ]
        .filter(Boolean)
        .join(';');
  
      return `ou:${userOrgUnits}`;
    }
  
    return `ou:${orgUnitIds};${orgUnitLevelIds};${orgUnitGroupIds}`;
  };
  