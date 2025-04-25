/**
 * Creates dynamic headings based on the analyticsPayloadDeterminer Filter property
 * and corresponding data in visualTitleAndSubTitle
 * 
 * @param {Object} analyticsPayloadDeterminer - Object containing Columns, Rows and Filter properties
 * @param {Object} visualTitleAndSubTitle - Object containing subtitle data
 * @returns {JSX.Element} - JSX element with the dynamic headings
 */
const getDynamicHeadings = (analyticsPayloadDeterminer, visualTitleAndSubTitle) => {
    // If no filter or visualTitleAndSubTitle is undefined, return null
    if (!analyticsPayloadDeterminer?.Filter || !visualTitleAndSubTitle?.DefaultSubTitle) {
      return null;
    }
  
    // Map filter items to their corresponding data
    const filterComponents = [];
  
    // Check if Filter contains "Period"
    if (analyticsPayloadDeterminer.Filter.includes("Period") && 
        visualTitleAndSubTitle.DefaultSubTitle.periods?.length > 0) {
      const periodsHeading = (
        <div className="flex justify-center gap-1">
          {visualTitleAndSubTitle.DefaultSubTitle.periods.map((period, index) => (
            <h4 key={`period-${index}`} className="text-center text-md font-medium text-gray-600 mt-1">
              {period.name}
              {index < visualTitleAndSubTitle.DefaultSubTitle.periods.length - 1 && ","}
            </h4>
          ))}
        </div>
      );
      filterComponents.push(periodsHeading);
    }
  
    // Check if Filter contains "Organisation unit"
    if (analyticsPayloadDeterminer.Filter.includes("Organisation unit") && 
        visualTitleAndSubTitle.DefaultSubTitle.orgUnits?.length > 0) {
      const orgUnitsHeading = (
        <div className="flex justify-center gap-1">
          {visualTitleAndSubTitle.DefaultSubTitle.orgUnits.map((orgUnit, index) => (
            <h4 key={`orgUnit-${index}`} className="text-center text-md font-medium text-gray-600 mt-1">
              {orgUnit.name}
              {index < visualTitleAndSubTitle.DefaultSubTitle.orgUnits.length - 1 && ","}
            </h4>
          ))}
        </div>
      );
      filterComponents.push(orgUnitsHeading);
    }
  
    // Check if Filter contains "Data"
    if (analyticsPayloadDeterminer.Filter.includes("Data") && 
        visualTitleAndSubTitle.DefaultSubTitle.dataElements?.length > 0) {
      const dataElementsHeading = (
        <div className="flex justify-center gap-1">
          {visualTitleAndSubTitle.DefaultSubTitle.dataElements.map((dataElement, index) => (
            <h4 key={`dataElement-${index}`} className="text-center text-md font-medium text-gray-600 mt-1">
              {dataElement.name}
              {index < visualTitleAndSubTitle.DefaultSubTitle.dataElements.length - 1 && ","}
            </h4>
          ))}
        </div>
      );
      filterComponents.push(dataElementsHeading);
    }
  
    // Return all filter components
    return (
      <div className="flex flex-col items-center">
        {filterComponents.map((component, index) => (
          <React.Fragment key={`filter-${index}`}>{component}</React.Fragment>
        ))}
      </div>
    );
  };
  
  // Example usage in a component
  export const VisualHeading = ({ analyticsPayloadDeterminer, visualTitleAndSubTitle }) => {
    return (
      <div className="headings-container">
        {/* Custom title if provided */}
        {visualTitleAndSubTitle?.visualTitle && (
          <h3 className="text-center text-lg font-bold text-gray-800">
            {visualTitleAndSubTitle.visualTitle}
          </h3>
        )}
        
        {/* Custom subtitle if provided */}
        {visualTitleAndSubTitle?.customSubTitle && (
          <h4 className="text-center text-md font-medium text-gray-600">
            {visualTitleAndSubTitle.customSubTitle}
          </h4>
        )}
        
        {/* Dynamic headings based on Filter */}
        {getDynamicHeadings(analyticsPayloadDeterminer, visualTitleAndSubTitle)}
      </div>
    );
  };