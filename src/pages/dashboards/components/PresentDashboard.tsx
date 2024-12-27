import React, { useState, useRef, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Button from "../../../components/Button";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import { FaPause, FaPlay } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import DashboardVisualItem from "./DashboardVisualItem";

interface PresentDashboardProps {
  dashboardData: any[];
  setIsPresentMode: (mode: boolean) => void;
  dashboardName: string;
}

const PresentDashboard: React.FC<PresentDashboardProps> = ({
  dashboardData,
  setIsPresentMode,
  dashboardName,
}) => {
  const [slidesToShow, setSlidesToShow] = useState(1);
  const [delay, setDelay] = useState(2000);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const autoplayPlugin = useRef(
    Autoplay({ delay, stopOnInteraction: true })
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      updateCurrentSlide();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      updateCurrentSlide();
    }
  }, [emblaApi]);

  const updateCurrentSlide = useCallback(() => {
    if (emblaApi) {
      setCurrentSlide(emblaApi.selectedScrollSnap() + 1);
    }
  }, [emblaApi]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const togglePause = useCallback(() => {
    if (isPaused) {
      autoplayPlugin.current.play();
    } else {
      autoplayPlugin.current.stop();
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePause();
      } else if (e.code === "Escape" && !isFullscreen) {
        setIsPresentMode(false);
      } else if (e.code === "ArrowLeft") {
        scrollPrev();
      } else if (e.code === "ArrowRight") {
        scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [togglePause, setIsPresentMode, isFullscreen, scrollPrev, scrollNext]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", updateCurrentSlide);
      updateCurrentSlide();
    }
  }, [emblaApi, updateCurrentSlide]);

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

  return (
    <div ref={containerRef} className="w-full h-full bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-primary">
            {dashboardName}
          </h3>
          <span className="text-sm text-muted-foreground">
            Slide {currentSlide} of {dashboardData.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <Label htmlFor="slidesToShow">Slides to Show</Label>
            <Input
              id="slidesToShow"
              type="number"
              min="1"
              max="5"
              value={slidesToShow}
              onChange={(e) => setSlidesToShow(Number(e.target.value))}
              className="w-full"
              aria-label="Number of slides to show"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delay">Delay (ms)</Label>
            <Input
              id="delay"
              type="number"
              min="500"
              step="500"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              className="w-full"
              aria-label="Slide transition delay in milliseconds"
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            <Button
              onClick={togglePause}
              text={isPaused ? "Play" : "Pause"}
              icon={isPaused ? <FaPlay className="w-4 h-4" /> : <FaPause className="w-4 h-4" />}
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            />
            <Button
              onClick={toggleFullscreen}
              text={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
            />
            <Button
              onClick={() => setIsPresentMode(false)}
              text="Exit"
              icon={<IoMdExit className="w-4 h-4" />}
              aria-label="Exit presentation mode"
            />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </button>

          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {dashboardData.map((item, index) => (
                <div
                  key={index}
                  className="flex-[0_0_auto] min-w-0 px-4"
                  style={{ width: `${100 / slidesToShow}%` }}
                >
                  <div className="space-y-2">
                    <h4 className="text-xl font-medium">
                      {index + 1}. {item.visualName}
                    </h4>
                    <DashboardVisualItem
                      query={item.visualQuery}
                      dataSourceId={item.dataSourceId}
                      visualType={item.visualType}
                      visualSettings={item.visualSettings}
                      visualTitleAndSubTitle={item.visualTitleAndSubTitle}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentDashboard;