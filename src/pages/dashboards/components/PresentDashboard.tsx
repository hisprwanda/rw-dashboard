
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";;
import Button from "../../../components/Button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../components/ui/carousel";

import DashboardVisualItem from "./DashboardVisualItem";

interface PresentDashboardProps {
    dashboardData:any;
    setIsPresentMode:any
}

const PresentDashboard: React.FC<PresentDashboardProps> = ({ dashboardData,setIsPresentMode}) => {
    console.log("the current data form",dashboardData)
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );



  const testQuery =  {
    "myData": {
      "params": {
        "dimension": [
          "dx:FCxwPx6VJL8;dOhkS4exZcQ;ZDtsTCIdWa9",
          "pe:LAST_12_MONTHS"
        ],
        "displayProperty": "NAME",
        "filter": "ou:USER_ORGUNIT",
        "includeNumDen": true
      },
      "resource": "analytics"
    }
  }

  return (<Carousel

      className="w-full max-w-xs"
    >
        <div>
        <Button onClick={()=>setIsPresentMode(false)} text= "Exit Present"   />
        </div>
      <CarouselContent>
    

{Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
               
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
};

export default PresentDashboard;