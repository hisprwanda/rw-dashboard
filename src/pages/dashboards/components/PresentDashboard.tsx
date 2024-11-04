import React, { useState, useRef, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
//import { Button } from "../../../components/ui/button";
import Button from "../../../components/Button";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import {FaPause, FaPlay} from "react-icons/fa"
import { IoMdExit } from "react-icons/io";
import DashboardVisualItem from "./DashboardVisualItem";

interface PresentDashboardProps {
    dashboardData: any;
    setIsPresentMode: any;
}


const PresentDashboard:React.FC<PresentDashboardProps> = ({ dashboardData, setIsPresentMode }) => {
  const [slidesToShow, setSlidesToShow] = useState(1);
  const [delay, setDelay] = useState(2000);
  const [isPaused, setIsPaused] = useState(false);

  const autoplayPlugin = useRef(
    Autoplay({ delay: delay, stopOnInteraction: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      dragFree: true,
    },
    [autoplayPlugin.current]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, slidesToShow]);

  useEffect(() => {
    if (autoplayPlugin.current) {
      autoplayPlugin.current.options.delay = delay;
      if (emblaApi) {
        emblaApi.reInit();
      }
    }
  }, [emblaApi, delay]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      autoplayPlugin.current.play();
    } else {
      autoplayPlugin.current.stop();
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  return (
    <div className="w-full mx-auto space-y-6 px-10 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="slidesToShow">Slides to Show</Label>
          <Input
            id="slidesToShow"
            type="number"
            min="1"
            max="5"
            value={slidesToShow}
            onChange={(e) => setSlidesToShow(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="delay">Delay (ms)</Label>
          <Input
            id="delay"
            type="number"
            min="500"
            step="500"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end justify-end   gap-2 ">
          <div className="flex  gap-2" >
          <Button onClick={togglePause}
          text=   {isPaused ? "Play" : "Pause"}
          icon = { isPaused ?  <FaPlay/> : <FaPause /> }
          />
        
          <Button onClick={()=>setIsPresentMode(false)} 
            text=" Exit present"
            icon={<IoMdExit />} 
            />
          </div>
       
            
        </div>
      </div>
{/* left arrow */}
      <div

        className="absolute left-0 top-[calc(50%+60px)] -translate-y-1/2 z-10 "
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-8 w-8 text-primary" />
      </div>

      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {dashboardData.map((item, index) => (
              <div key={index} className="flex-[0_0_auto] min-w-0 pl-4" style={{ width: `${100 / slidesToShow}%` }}>
                  <span className="text-2xl font-semibold">{index + 1}.{item.visualName}</span>
                 <DashboardVisualItem  query={item.visualQuery} visualType={item.visualType}  />
               
              </div>
            ))}
          </div>
        </div>
      </div>
{/* right arrow */}
      <div
        className="absolute right-0 top-[calc(50%+60px)] -translate-y-1/2 z-10   "
        onClick={scrollNext}
      >
        <ChevronRight className="h-8 w-8 text-primary"  />
      </div>
    </div>
  );
};

export default PresentDashboard;
