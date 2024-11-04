import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
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
    dashboardData: any;
    setIsPresentMode: any;
}

const PresentDashboard: React.FC<PresentDashboardProps> = ({ dashboardData, setIsPresentMode }) => {
  console.log("Present Dashboard data",dashboardData)
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  const testQuery = {
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
  };

  return (
    <div  >
{/* options */}
<div className=" flex justify-center mt-2 " >
<Button text="Exit Present" onClick={()=>setIsPresentMode(false)} />

</div>
   

<div className="w-screen h-screen flex justify-center items-center">
      <Carousel
        plugins={[plugin.current]}
        className="w-4/5 h-4/5"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="w-full h-full">
          {dashboardData.map((item, index) => (
            <CarouselItem key={index} className="w-full h-full">
              <DashboardVisualItem  query={item.visualQuery} visualType={item.visualType}  />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
    </div>
  
  );
};

export default PresentDashboard;
