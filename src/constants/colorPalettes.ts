import {ColorPaletteTypes} from "../types/visualSettingsTypes"


export const systemDefaultColorPalettes:ColorPaletteTypes  = [
    {
     name:"palette One",
     itemsBackgroundColors: [`hsl(var(--chart-1))`, `hsl(var(--chart-2))`,`hsl(var(--chart-3))`,`hsl(var(--chart-4))`,`hsl(var(--chart-5))`],
     chartContainerBackground:"#9dff00"
   },
   {
     name:"palette Two",
     itemsBackgroundColors: ["#FF5733", "#33FF57", "#3357FF"],
     chartContainerBackground:"#ff00fb"
   }     
 ]