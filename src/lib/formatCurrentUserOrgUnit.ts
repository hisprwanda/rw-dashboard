
///// this function is used to format org units from saved query from 
//datastore into their origin structure before being saved into datastore. 
// and the organization units it formats are the ones which attached to the current login user


 export function formatCurrentUserSelectedOrgUnit(orgUnitString:any)  {
  // Remove the 'ou:' prefix if it exists
  const cleanedString = orgUnitString?.startsWith('ou:') ? orgUnitString?.slice(3) : orgUnitString;

  // Split by ';' and ',' to get the individual values
  const orgUnits = cleanedString ? cleanedString.split(/[;,]/) : [];

  // Create the result object with default values set to false
  const result = {
    is_USER_ORGUNIT: false,
    is_USER_ORGUNIT_CHILDREN: false,
    is_USER_ORGUNIT_GRANDCHILDREN: false,
  };

  // Check for the presence of each key in the string
  if (orgUnits.includes('USER_ORGUNIT')) {
    result.is_USER_ORGUNIT = true;
  }
  if (orgUnits.includes('USER_ORGUNIT_CHILDREN')) {
    result.is_USER_ORGUNIT_CHILDREN = true;
  }
  if (orgUnits.includes('USER_ORGUNIT_GRANDCHILDREN')) {
    result.is_USER_ORGUNIT_GRANDCHILDREN = true;
  }

  return result;
}




//// function to format organization units those which are nested into the format they had before being stored in datastore

export function formatSelectedOrganizationUnit(input:string):string[]{
  try {
    // Check if input is a string
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // Split the string by ';' and filter out empty entries
    const items = input.split(';').filter(Boolean);
    
    // Remove 'ou:' prefix from each item if it exists
    const parsedItems = items.map(item => {
      return item?.startsWith('ou:') ? item?.slice(3) : item;
    });

    return parsedItems;
  } catch (error:any) {
    console.error('Error parsing string:', error.message);
    return [];
  }
}



export function formatOrgUnitGroup(input: string): string[] {
  try {
      // Ensure the input is a string
      if (typeof input !== 'string') {
          throw new Error("Input must be a string");
      }

      // Split the input string by ';' and trim spaces
      const parts = input.split(';').map(part => part.trim());

      // Filter out parts that start with 'OU_GROUP-' and remove that prefix
      const ouGroups = parts
          .filter(part => part?.startsWith('OU_GROUP-'))
          .map(part => part?.replace('OU_GROUP-', '').trim());

      // Check if any valid OU_GROUP entries were found
      if (ouGroups?.length === 0) {
          throw new Error("No valid 'OU_GROUP-' entries found in the input");
      }

      return ouGroups;

  } catch (error:any) {
      console.error(error.message);
      return []; // Return an empty array in case of any error
  }
}




export function formatOrgUnitLevels(input: string): string[] {
  try {
      // Ensure the input is a string
      if (typeof input !== 'string') {
          throw new Error("Input must be a string");
      }

      // Split the input string by ';' and trim spaces
      const parts = input.split(';').map(part => part.trim());

      // Filter out parts that start with 'LEVEL-' and remove that prefix
      const levelGroups = parts
          ?.filter(part => part?.startsWith('LEVEL-'))
          .map(part => part?.replace('LEVEL-', '').trim());

      // Check if any valid LEVEL entries were found
      if (levelGroups?.length === 0) {
          throw new Error("No valid 'LEVEL-' entries found in the input");
      }

      return levelGroups;

  } catch (error) {
      console.error(error.message);
      return []; // Return an empty array in case of any error
  }
}