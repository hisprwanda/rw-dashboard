// Define TypeScript interfaces for the input structure
export interface MetadataItem {
    uid: string;
    code?: string;
    name: string;
    dimensionItemType?: string;
    valueType?: string;
    totalAggregationType?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    aggregationType?: string;
    dimensionType?: string;
  }
  
  export interface MetadataLabels {
    items?: Record<string, MetadataItem>;
    dimensions?: Record<string, string[]>;
  }
  
  // Define interfaces for the transformed output
  export interface TransformedDimension<T> {
    ids: string[];
    items: T[];
  }
  
  export interface PeriodItem extends MetadataItem {
    startDate: string;
    endDate: string;
    type?: 'month' | 'quarter' | 'year' | 'other';
  }
  
  export interface DataItem extends MetadataItem {
    description?: string;
  }
  
  export interface OrganizationUnitItem extends MetadataItem {
    code?: string;
  }
  
  export interface CategoryOptionItem extends MetadataItem {
    // Add specific fields for category options if needed
  }
  
  export interface TransformedMetadata {
    periods: TransformedDimension<PeriodItem>;
    dataElements: TransformedDimension<DataItem>;
    orgUnits: TransformedDimension<OrganizationUnitItem>;
    categoryOptions: TransformedDimension<CategoryOptionItem>;
    dimensionTypes: Record<string, string>;
    original: MetadataLabels;
  }
  
  /**
   * Creates an empty transformed metadata structure
   * @returns An empty TransformedMetadata object
   */
  function createEmptyTransformedMetadata(): TransformedMetadata {
    return {
      periods: { ids: [], items: [] },
      dataElements: { ids: [], items: [] },
      orgUnits: { ids: [], items: [] },
      categoryOptions: { ids: [], items: [] },
      dimensionTypes: {},
      original: { items: {}, dimensions: {} }
    };
  }
  
  /**
   * Safely transforms DHIS2-like metadata labels into a more usable format for frontend consumption
   * with comprehensive error handling
   * @param metadataLabels The original metadata labels object
   * @returns A transformed metadata object with easy access to dimensions and their items
   */
  export function transformMetadataLabels(metadataLabels?: MetadataLabels): TransformedMetadata {
    // Handle undefined or null input
    if (!metadataLabels) {
      console.warn('transformMetadataLabels: No metadata provided');
      return createEmptyTransformedMetadata();
    }
  
    const { items = {}, dimensions = {} } = metadataLabels;
    
    // Initialize result structure
    const result = createEmptyTransformedMetadata();
    result.original = metadataLabels;
    
    try {
      // Store dimension types for reference
      for (const key in items) {
        const item = items[key];
        if (item?.dimensionType) {
          result.dimensionTypes[key] = item.dimensionType;
        }
      }
      
      // Process period dimensions
      if (dimensions.pe?.length) {
        result.periods.ids = dimensions.pe;
        result.periods.items = dimensions.pe.map(id => {
          // Skip if the item doesn't exist
          if (!items[id]) {
            console.warn(`Period item with id ${id} not found`);
            return {
              uid: id,
              name: id, // Default to using the id as name
              startDate: '',
              endDate: '',
              type: 'other'
            } as PeriodItem;
          }
          
          const item = items[id];
          let type: 'month' | 'quarter' | 'year' | 'other' = 'other';
          
          // Determine period type based on ID format
          if (/^\d{6}$/.test(id)) {
            type = 'month';
          } else if (/^\d{4}Q[1-4]$/.test(id)) {
            type = 'quarter';
          } else if (/^\d{4}$/.test(id)) {
            type = 'year';
          }
          
          return {
            ...item,
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            type
          } as PeriodItem;
        });
      }
      
      // Process data element dimensions
      if (dimensions.dx?.length) {
        result.dataElements.ids = dimensions.dx;
        result.dataElements.items = dimensions.dx.map(id => {
          if (!items[id]) {
            console.warn(`Data element with id ${id} not found`);
            return { uid: id, name: id } as DataItem;
          }
          return items[id] as DataItem;
        });
      }
      
      // Process organization unit dimensions
      if (dimensions.ou?.length) {
        result.orgUnits.ids = dimensions.ou;
        result.orgUnits.items = dimensions.ou.map(id => {
          if (!items[id]) {
            console.warn(`Organization unit with id ${id} not found`);
            return { uid: id, name: id } as OrganizationUnitItem;
          }
          return items[id] as OrganizationUnitItem;
        });
      }
      
      // Process category option dimensions
      if (dimensions.co?.length) {
        result.categoryOptions.ids = dimensions.co;
        result.categoryOptions.items = dimensions.co.map(id => {
          if (!items[id]) {
            console.warn(`Category option with id ${id} not found`);
            return { uid: id, name: id } as CategoryOptionItem;
          }
          return items[id] as CategoryOptionItem;
        });
      }
    } catch (error) {
      console.error('Error transforming metadata labels:', error);
      // Return empty structure on error, but keep original data
      return {
        ...createEmptyTransformedMetadata(),
        original: metadataLabels
      };
    }
    
    return result;
  }
  
  /**
   * A more flexible utility function to get dimension items by type,
   * with error handling
   * @param transformedMetadata The transformed metadata object
   * @param dimensionKey The dimension key to retrieve items from
   * @returns Array of dimension items, or empty array if not found
   */
  export function getDimensionItems<T>(transformedMetadata?: TransformedMetadata, dimensionKey?: keyof TransformedMetadata): T[] {
    if (!transformedMetadata) {
      console.warn('getDimensionItems: No transformedMetadata provided');
      return [];
    }
    
    if (!dimensionKey) {
      console.warn('getDimensionItems: No dimensionKey provided');
      return [];
    }
    
    try {
      const dimension = transformedMetadata[dimensionKey];
      if (!dimension || typeof dimension !== 'object' || !('items' in dimension)) {
        console.warn(`getDimensionItems: Dimension ${String(dimensionKey)} not found or doesn't have items`);
        return [];
      }
      
      return (dimension as TransformedDimension<T>).items || [];
    } catch (error) {
      console.error(`Error getting dimension items for ${String(dimensionKey)}:`, error);
      return [];
    }
  }