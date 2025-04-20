  /**
 * Updates query parameters based on analytics payload determiner settings
 * @param {Object} queryParams - The original query parameters
 * @param {Object} analyticsPayloadDeterminer - The configuration for columns, rows, and filters
 * @returns {Object} Updated query parameters
 */
/**
 * Updates query parameters based on analytics payload determiner settings
 * @param {Object} queryParams - The original query parameters
 * @param {Object} analyticsPayloadDeterminer - The configuration for columns, rows, and filters
 * @returns {Object} Updated query parameters
 */
export function updateQueryParams(queryParams, analyticsPayloadDeterminer) {
    // Create a deep copy of queryParams to avoid mutating the original
    const updatedQueryParams = JSON.parse(JSON.stringify(queryParams));
    
    // Extract existing dimension values by prefix
    const dimensionMap = {};
    if (updatedQueryParams.dimension) {
      updatedQueryParams.dimension.forEach(dim => {
        const [prefix] = dim.split(':');
        dimensionMap[prefix] = dim;
      });
    }
    
    // Extract filter values by prefix
    const filterMap = {};
    if (updatedQueryParams.filter) {
      if (Array.isArray(updatedQueryParams.filter)) {
        updatedQueryParams.filter.forEach(filter => {
          const [prefix] = filter.split(':');
          filterMap[prefix] = filter;
        });
      } else {
        const [prefix] = updatedQueryParams.filter.split(':');
        filterMap[prefix] = updatedQueryParams.filter;
      }
    }
    
    // Helper function to map dimension names to their prefixes
    const getDimensionPrefix = (name) => {
      switch (name) {
        case 'Data': return 'dx';
        case 'Period': return 'pe';
        case 'Organisation unit': return 'ou';
        default: return name.toLowerCase();
      }
    };
    
    // Combine all available values
    const allAvailableValues = {...dimensionMap, ...filterMap};
    
    // If Filter is empty, include all items in dimension
    if (analyticsPayloadDeterminer.Filter.length === 0) {
      // Initialize new dimension array
      const newDimensions = [];
      
      // Add all items from Columns and Rows to dimension
      [...analyticsPayloadDeterminer.Columns, ...analyticsPayloadDeterminer.Rows].forEach(item => {
        const prefix = getDimensionPrefix(item);
        // Use existing value if available, otherwise this would be an error case
        if (allAvailableValues[prefix]) {
          newDimensions.push(allAvailableValues[prefix]);
        }
      });
      
      updatedQueryParams.dimension = newDimensions;
      // Remove filter property
      delete updatedQueryParams.filter;
    } else {
      // Initialize new arrays
      const newDimensions = [];
      const newFilters = [];
      
      // Process columns and rows (these go to dimension)
      [...analyticsPayloadDeterminer.Columns, ...analyticsPayloadDeterminer.Rows].forEach(item => {
        const prefix = getDimensionPrefix(item);
        if (allAvailableValues[prefix]) {
          newDimensions.push(allAvailableValues[prefix]);
        }
      });
      
      // Process filter items
      analyticsPayloadDeterminer.Filter.forEach(item => {
        const prefix = getDimensionPrefix(item);
        if (allAvailableValues[prefix]) {
          newFilters.push(allAvailableValues[prefix]);
        }
      });
      
      // Update dimension array
      updatedQueryParams.dimension = newDimensions;
      
      // Update filter (could be a string or array based on your examples)
      if (newFilters.length === 1) {
        updatedQueryParams.filter = newFilters[0];
      } else if (newFilters.length > 1) {
        updatedQueryParams.filter = newFilters;
      } else {
        delete updatedQueryParams.filter;
      }
    }
    
    return updatedQueryParams;
  }
  
  /**
   * Reverses the queryParams transformation, converting updated params back to original format
   * @param {Object} updatedQueryParams - The transformed query parameters
   * @returns {Object} Original-style query parameters
   */
  export function reverseQueryParamsTransformation(updatedQueryParams, analyticsPayloadDeterminer) {
    // Create a deep copy to avoid mutating the input
    const originalParams = JSON.parse(JSON.stringify(updatedQueryParams));
    
    // Helper function to map dimension names to their prefixes
    const getDimensionPrefix = (name) => {
      switch (name) {
        case 'Data': return 'dx';
        case 'Period': return 'pe';
        case 'Organisation unit': return 'ou';
        default: return name.toLowerCase();
      }
    };
    
    // Create a map of all prefixes and their categories from analyticsPayloadDeterminer
    const prefixCategoryMap = {};
    
    // Map columns to their prefixes
    analyticsPayloadDeterminer.Columns.forEach(item => {
      prefixCategoryMap[getDimensionPrefix(item)] = 'Columns';
    });
    
    // Map rows to their prefixes
    analyticsPayloadDeterminer.Rows.forEach(item => {
      prefixCategoryMap[getDimensionPrefix(item)] = 'Rows';
    });
    
    // Map filters to their prefixes
    analyticsPayloadDeterminer.Filter.forEach(item => {
      prefixCategoryMap[getDimensionPrefix(item)] = 'Filter';
    });
    
    // Create dimension and filter arrays
    let dimensions = [];
    let filters = [];
    
    // Process dimensions from updated params
    if (originalParams.dimension) {
      const dimensionArray = Array.isArray(originalParams.dimension) ? 
        originalParams.dimension : [originalParams.dimension];
        
      dimensionArray.forEach(dim => {
        const prefix = dim.split(':')[0];
        if (prefixCategoryMap[prefix] === 'Columns' || prefixCategoryMap[prefix] === 'Rows') {
          dimensions.push(dim);
        } else {
          // If it's not explicitly in Columns or Rows, we'll assume it belongs in dimension
          dimensions.push(dim);
        }
      });
    }
    
    // Process filters from updated params
    if (originalParams.filter) {
      const filterArray = Array.isArray(originalParams.filter) ? 
        originalParams.filter : [originalParams.filter];
        
      filterArray.forEach(filter => {
        const prefix = filter.split(':')[0];
        if (prefixCategoryMap[prefix] === 'Filter') {
          filters.push(filter);
        } else {
          // If it's not explicitly in Filter but present as a filter, keep it
          filters.push(filter);
        }
      });
    }
    
    // Check for any items in Filter that aren't in the current filters but are in dimensions
    analyticsPayloadDeterminer.Filter.forEach(item => {
      const prefix = getDimensionPrefix(item);
      const isInFilters = filters.some(f => f.startsWith(`${prefix}:`));
      const matchingDimension = dimensions.find(d => d.startsWith(`${prefix}:`));
      
      if (!isInFilters && matchingDimension) {
        // Move from dimensions to filters
        filters.push(matchingDimension);
        dimensions = dimensions.filter(d => d !== matchingDimension);
      }
    });
    
    // Update the original params
    originalParams.dimension = dimensions;
    
    if (filters.length === 0) {
      delete originalParams.filter;
    } else if (filters.length === 1) {
      originalParams.filter = filters[0];
    } else {
      originalParams.filter = filters;
    }
    
    return originalParams;
  }