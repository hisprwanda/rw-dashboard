export type BasemapType = 'osm-light' | 'osm-detailed';

// MapSidebar Props Type
export type MapSidebarProps = {
  basemaps: Record<BasemapType, BasemapConfig>;
  currentBasemap: BasemapType;
  onBasemapChange: (basemap: BasemapType) => void;
  singleSavedMapData?:any
};
// Basemap Configuration Type
export type BasemapConfig = {
  imgUrl: string;
  url: string;
  name: string;
  attribution: string;
};

export interface ProcessedDistrict {
  id: string;
  name: string;
  value: number | null;
  coordinates: number[][][];
  code: string;
  region: string;
}

export interface LegendClass {
  name: string;
  startValue: number;
  endValue: number;
  color: string;
}

export interface Legend {
  name: string;
  legends: LegendClass[];
}

