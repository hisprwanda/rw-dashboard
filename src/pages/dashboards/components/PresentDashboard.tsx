import React, { useState, useRef, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Button from "../../../components/Button";

import { FaPause, FaPlay } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import DashboardVisualItem from "./DashboardVisualItem";
import song1 from "../../../songs/song1.mp3";
import song2 from "../../../songs/song2.mp3";
import song3 from "../../../songs/song3.mp3";


import { ChevronLeft, ChevronRight, Music2, Pause, Play, RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
const mp3Files = [
  { name: "Track 1", src: song1 },
  { name: "Track 2", src: song2 },
  { name: "Track 3", src: song3 }
];

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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isTrackPaused, setIsTrackPaused] = useState(false)
  
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [slidesToShow, setSlidesToShow] = useState(1);
  const [delay, setDelay] = useState(2000);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

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
      setShowControls(false);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setShowControls(true);
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

  const handleMouseMove = useCallback(() => {
    if (isFullscreen) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setShowControls(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      } else if (e.code === "KeyF") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [togglePause, setIsPresentMode, isFullscreen, scrollPrev, scrollNext, toggleFullscreen]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", updateCurrentSlide);
      updateCurrentSlide();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
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


  /// handle song
    const handleTrackChange = (value: string) => {
      setCurrentTrack(value);
      if (audioRef.current) {
        audioRef.current.src = value;
        audioRef.current.play();
     
      }
    };
  
    const resetAudio = () => {
      if (audioRef.current  && audioRef.current.src) {
        audioRef.current.currentTime = 0;
     
      }
    };
 // Function to play the audio
 const playAudio = () => {
  if (audioRef.current && audioRef.current.src && audioRef.current.readyState >= 2) {
    audioRef.current.play();
    setIsTrackPaused(false);
  }
};


// Function to pause the audio
const pauseAudio = () => {
  if (audioRef.current && audioRef.current.src) {
    audioRef.current.pause();
    setIsTrackPaused(true)
  }
};

// Function to stop the audio
const stopAudio = () => {
  if (audioRef.current) {
    audioRef.current.src = null
    setCurrentTrack(null)
  }
};

  
  
    const togglePlayback = useCallback(() => {
      if (isPaused) {

        autoplayPlugin.current.play();
         playAudio()
       // audioRef.current?.play();
      } else {
        autoplayPlugin.current.stop();
        pauseAudio()
       // audioRef.current?.pause();
      }
      setIsPaused(!isPaused);
    }, [isPaused]);

      useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
          if (event.code === "Space") {
            event.preventDefault();
            togglePlayback();
          }
        };
    
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
      }, [isPaused]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full bg-background transition-all duration-300 ${isFullscreen ? 'p-0' : 'p-6'}`}
      onMouseMove={handleMouseMove}
    >
      <div className={`max-w-7xl mx-auto space-y-6 ${isFullscreen ? 'h-screen flex flex-col' : 'min-h-screen flex flex-col'}`}>
      <div className="flex items-center justify-center gap-2  ">
            <h3 className={`text-2xl font-semibold text-center ${isFullscreen ? 'text-white' : 'text-primary'}`}>
            {dashboardName}
          </h3>
          <span className={`text-sm text-muted-foreground font-semibold ${isFullscreen ? 'text-white' : 'text-primary'}`}>
     (Slide {currentSlide} of {dashboardData.length}) 
</span>

            </div>
      
        {(!isFullscreen || showControls) && (
          <>
          

            {!isFullscreen && (
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
            <div className="flex  justify-between">
              {/* Main Controls Row */}
              <div className="flex flex-wrap gap-4">
                {/* Slides and Delay Controls */}
                <div className="flex gap-4 min-w-[200px]">
                  <div className="flex-1">
                    <Label htmlFor="slidesToShow" className="text-sm">Slides</Label>
                    <Input
                      id="slidesToShow"
                      type="number"
                      min="1"
                      max="5"
                      value={slidesToShow}
                      onChange={(e) => setSlidesToShow(Number(e.target.value))}
                      className="h-9"
                      aria-label="Number of slides to show"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="delay" className="text-sm">Delay (ms)</Label>
                    <Input
                      id="delay"
                      type="number"
                      min="500"
                      step="500"
                      value={delay}
                      onChange={(e) => setDelay(Number(e.target.value))}
                      className="h-9"
                      aria-label="Slide transition delay in milliseconds"
                    />
                  </div>
                </div>
      
                {/* Music Controls */}
                <div className="min-w-[220px]">
                  <Label className="text-sm flex items-center gap-2">
                    <Music2 className="" /> Background Music
                  </Label>
                  <div className="flex gap-2">
                    <Select value={currentTrack || ''} onValueChange={handleTrackChange}>
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue placeholder="Select a track" />
                      </SelectTrigger>
                      <SelectContent>
                        {mp3Files.map((file, index) => (
                          <SelectItem key={index} value={file.src}>
                            {file.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                    onClick={resetAudio}
                    text=""
                    icon={<RotateCcw className="h-5 w-5" />}
                  />
                    <Button
                    onClick={ isTrackPaused ? playAudio : pauseAudio}
                    text= "Track"
                    icon={isPaused ? <FaPlay className="w-4 h-4" /> : <FaPause className="w-4 h-4" />}
                  />
                    <Button
                    onClick={stopAudio}
                    text="Stop"
                    variant="danger"
                  />
                  </div>
                </div>
      
            
              </div>

                  {/* Presentation Controls */}
                  <div className="flex gap-2 items-end">
                <Button
                    onClick={togglePause}
                    text="Slides"
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
          </div>
            )}
          </>
        )}

        <div className="flex-1 flex items-center relative">
          <button
            onClick={scrollPrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors ${
              isFullscreen && !showControls ? 'opacity-0' : 'opacity-100'
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </button>

          <div ref={emblaRef} className="overflow-hidden h-full w-full">
            <div className="flex h-full items-center ">
              {dashboardData.map((item, index) => (
                <div
                  key={index}
                  className="flex-[0_0_auto] min-w-0 w-full h-full flex items-center"
                  style={{ width: `${100 / slidesToShow}%`,backgroundColor:item.visualSettings.backgroundColor }}
                >
                  <div className=" w-full">
                  <h4 
                  className={`text-xl font-medium text-center ${
            (!isFullscreen || showControls) ? "text-gray-400" : "text-gray-400"
                   }`}
                 >
                {index + 1}. {item.visualName}
                   </h4>

                    <div className="h-full" style={{backgroundColor:item.visualSettings.backgroundColor}} >
                      <DashboardVisualItem
                        query={item.visualQuery}
                        dataSourceId={item.dataSourceId}
                        visualType={item.visualType}
                        visualSettings={item.visualSettings}
                        visualTitleAndSubTitle={item.visualTitleAndSubTitle}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors ${
              isFullscreen && !showControls ? 'opacity-0' : 'opacity-100'
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-primary" />
          </button>
        </div>

        {isFullscreen && showControls && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 p-2 rounded-lg backdrop-blur-sm">
            <Button
              onClick={togglePause}
              text={isPaused ? "Play" : "Pause"}
              icon={isPaused ? <FaPlay className="w-4 h-4" /> : <FaPause className="w-4 h-4" />}
            />
            <Button
              onClick={toggleFullscreen}
              text="Exit Fullscreen"
              icon={<Minimize2 className="w-4 h-4" />}
            />
          </div>
        )}
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default PresentDashboard;