export interface VisualTitleAndSubtitleType {
    visualTitle?: string;
    customSubTitle?:string;
    DefaultSubTitle: {
      periods:any[];
      orgUnits:any[];
      dataElements:any[];
    };
  
  }

  export type ColorPaletteTypes = Array<{
    name: string; 
    itemsBackgroundColors: string[];

  }>;
  
  export type visualColorPaletteTypes ={
    name: string; 
    itemsBackgroundColors: string[];
  }

   export type AxisSettingsTypes = {
    color: string;
    fontSize:number
  }
  export interface VisualSettingsTypes {
    visualColorPalette:visualColorPaletteTypes;
    backgroundColor:string,
    fillColor:string,
    XAxisSettings:AxisSettingsTypes,
    YAxisSettings:AxisSettingsTypes
  }

  export interface genericChartsProps {
    data: any;
    visualTitleAndSubTitle:VisualTitleAndSubtitleType;
    visualSettings:VisualSettingsTypes;
    metaDataLabels:any
}