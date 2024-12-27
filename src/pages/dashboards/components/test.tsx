import React, { useState, useRef, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Toggle } from "../../../components/ui/toggle";
import { Card, CardContent } from "../../../components/ui/card";
import { Slider } from "../../../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import Button from "../../../components/Button";
import { IoMdExit } from "react-icons/io";
import { ChevronLeft, ChevronRight, Music2, Pause, Play, RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import DashboardVisualItem from "./DashboardVisualItem";
import song1 from "../../../songs/song1.mp3";

interface PresentDashboardProps {
  dashboardData: any;
  setIsPresentMode: (mode: boolean) => void;
  dashboardName: string;
}

const mp3Files = [
  { name: "Track 1", src: song1 },
  { name: "Track 2", src: song1 },
  { name: "Track 3", src: song1 },
];

const PresentDashboard: React.FC<PresentDashboardProps> = ({
  dashboardData,
  setIsPresentMode,
  dashboardName,
}) => {
  const [slidesToShow, setSlidesToShow] = useState(1);
  const [delay, setDelay] = useState(5000);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const presentationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const autoplayPlugin = useRef(
    Autoplay({ delay: delay, stopOnInteraction: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [autoplayPlugin.current]
  );

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

  useEffect(() => {
    if (emblaApi && autoplayPlugin.current) {
      autoplayPlugin.current.options.delay = delay;
      emblaApi.reInit();
    }
  }, [emblaApi, delay]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      presentationRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        setShowControls(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleTrackChange = (value: string) => {
    setCurrentTrack(value);
    if (audioRef.current) {
      audioRef.current.src = value;
      audioRef.current.play();
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const togglePlayback = useCallback(() => {
    if (isPaused) {
      autoplayPlugin.current.play();
      audioRef.current?.play();
    } else {
      autoplayPlugin.current.stop();
      audioRef.current?.pause();
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  return (
    <div 
      ref={presentationRef}
      className={`w-full min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    >
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-sm p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h3 className="text-2xl font-semibold">{dashboardName}</h3>
          <div className="flex items-center gap-4">
            <Toggle 
              pressed={!showControls} 
              onPressedChange={(pressed) => setShowControls(!pressed)}
              aria-label="Toggle controls"
              className={`${darkMode ? 'data-[state=on]:bg-gray-700 hover:bg-gray-600' : ''}`}
            >
              <ZoomIn className="h-4 w-4" />
            </Toggle>
            <Toggle 
              pressed={darkMode} 
              onPressedChange={setDarkMode}
              aria-label="Toggle theme"
              className={`${darkMode ? 'data-[state=on]:bg-gray-700 hover:bg-gray-600' : ''}`}
            >
              {darkMode ? '🌙' : '☀️'}
            </Toggle>
            <Button
              onClick={toggleFullscreen}
              text=""
              icon={isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              className={`${darkMode ? 'border-gray-700 hover:bg-gray-600' : ''}`}
            />
            <Button
              onClick={() => setIsPresentMode(false)}
              text=""
              icon={<IoMdExit className="h-4 w-4" />}
              className={`${darkMode ? 'border-gray-700 hover:bg-gray-600' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && !isFullscreen && (
        <Card className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column - Slide Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className={`text-sm ${darkMode ? 'text-gray-200' : ''}`}>Slides to Show</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setSlidesToShow(Math.max(1, slidesToShow - 1))}
                      text=""
                      icon={<ZoomOut className="h-4 w-4" />}
                      className={`${darkMode ? 'border-gray-700 hover:bg-gray-600' : ''}`}
                    />
                    <span className="w-8 text-center">{slidesToShow}</span>
                    <Button
                      onClick={() => setSlidesToShow(Math.min(5, slidesToShow + 1))}
                      text=""
                      icon={<ZoomIn className="h-4 w-4" />}
                      className={`${darkMode ? 'border-gray-700 hover:bg-gray-600' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={`text-sm ${darkMode ? 'text-gray-200' : ''}`}>Slide Duration</Label>
                  <Slider 
                    value={[delay]}
                    min={2000}
                    max={10000}
                    step={1000}
                    onValueChange={(value) => setDelay(value[0])}
                    className={darkMode ? '[&_.slider-thumb]:bg-gray-200' : ''}
                  />
                  <div className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {(delay / 1000).toFixed(1)}s
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={togglePlayback}
                    text={isPaused ? 'Resume Slides' : 'Pause Slides'}
                    icon={isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    className={`${darkMode ? 'border-gray-700 hover:bg-gray-600' : ''} w-full`}
                  />
                </div>
              </div>

              {/* Right Column - Audio Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-200' : ''}`}>
                    <Music2 className="h-4 w-4" /> Background Music
                  </Label>
                  <Select value={currentTrack || ''} onValueChange={handleTrackChange}>
                    <SelectTrigger className={darkMode ? 'border-gray-700 text-gray-200' : ''}>
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                      {mp3Files.map((file, index) => (
                        <SelectItem 
                          key={index} 
                          value={file.src}
                          className={darkMode ? 'text-gray-200 hover:bg-gray-700' : ''}
                        >
                          {file.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={resetAudio}
                    text=""
                    icon={<RotateCcw className="h-5 w-5" />}
                    className={`${darkMode ? 'border-gray-700 hover:bg-gray-600' : ''}`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className={`pt-20 pb-32 px-6 ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}>
        <div className="relative max-w-7xl mx-auto h-full">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10">
            <Button
              onClick={scrollPrev}
              text=""
              icon={<ChevronLeft className="h-6 w-6" />}
              className={`${darkMode ? 'hover:bg-gray-800 text-white' : ''}`}
            />
          </div>

          <div ref={emblaRef} className="overflow-hidden h-full">
            <div className="flex h-full">
              {dashboardData.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex-[0_0_auto] min-w-0 pl-4"
                  style={{ width: `${100 / slidesToShow}%` }}
                >
                  <span className={`text-xl font-semibold mb-2 block ${darkMode ? 'text-gray-200' : ''}`}>
                    {index + 1}. {item.visualName}
                  </span>
                  <div className="p-4 bg-white rounded-lg shadow-sm ">
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

          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10">
            <Button
              onClick={scrollNext}
              text=""
              icon={<ChevronRight className="h-6 w-6" />}
              className={`${darkMode ? 'hover:bg-gray-800 text-white' : ''}`}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default PresentDashboard;