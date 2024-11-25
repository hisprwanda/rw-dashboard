export interface VisualTitleAndSubtitleType {
    visualTitle: string;
    customSubTitle:string;
    DefaultSubTitle: string[];
  
  }

  export type ColorPaletteTypes = Array<{
    name: string; 
    itemsBackgroundColors: string[];
    chartContainerBackground: string;
  }>;
  
  export type visualColorPaletteTypes ={
    name: string; 
    itemsBackgroundColors: string[];
    chartContainerBackground: string;
  }
  export interface VisualSettingsTypes {
    visualColorPalette:visualColorPaletteTypes
  
  }

  export interface genericChartsProps {
    data: any;
    visualTitleAndSubTitle:VisualTitleAndSubtitleType;
    visualSettings:VisualSettingsTypes
}