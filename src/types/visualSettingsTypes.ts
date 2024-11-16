export interface VisualTitleAndSubtitleType {
    visualTitle: string;
    customSubTitle:string;
    DefaultSubTitle: string[];
  
  }
  export interface VisualSettingsTypes {
    backgroundColor: string;
  
  }

  export interface genericChartsProps {
    data: any;
    visualTitleAndSubTitle:VisualTitleAndSubtitleType;
    visualSettings:VisualSettingsTypes
}