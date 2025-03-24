import { InputData } from "../../../lib/localGenericchartFormat";
import { ChartConfig } from "../../../components/ui/chart";
import {visualColorPaletteTypes} from "../../../types/visualSettingsTypes"
import { dimensionDataHardCoded } from "../../../constants/bulletinDimension";



export function generateBulletinChartConfig(inputData: InputData,selectedColorPalette?:visualColorPaletteTypes): ChartConfig {
  console.log("Selected color palette:", selectedColorPalette);
  console.log("Selected inputDAta:", inputData);

  const config: ChartConfig = {};
  const inputDataArray = Object.values(inputData);
  inputDataArray.forEach((item: string, index: number) => {
    const name = item.name;

    // Determine color based on the format of selectedColorPalette
    const color =
      selectedColorPalette.itemsBackgroundColors.every(color => color.startsWith("hsl")) // Check if all are HSL
        ? selectedColorPalette.itemsBackgroundColors[index] || `hsl(var(--chart-${index + 1}))`
        : selectedColorPalette.itemsBackgroundColors[index] || selectedColorPalette.itemsBackgroundColors[0]; // Use first color as fallback for HEX or RGB

    config[name] = {
      label: name,
      color,
    };
  });

  return config;
}