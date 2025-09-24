import React, { useState, useRef, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Button from "../../../components/Button";
import { useConfig } from '@dhis2/app-runtime';

import { FaPause, FaPlay } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import DashboardVisualItem from "./DashboardVisualItem";
import SingleMapItem from "../../Map/components/SingleMapItem";
import i18n from '../../../locales/index.js'

import { ChevronLeft, ChevronRight, Music2, Pause, Play, RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw } from "lucide-react";

interface PresentDashboardProps {
  dashboardData: any[];
  setIsPresentMode: (mode: boolean) => void;
  dashboardName: string;
  dashboardMaps?: any[];  // Optional maps prop
}

const PresentDashboard: React.FC<PresentDashboardProps> = ({
  dashboardData,
  setIsPresentMode,
  dashboardName,
  dashboardMaps = []  // Default to empty array
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isTrackPaused, setIsTrackPaused] = useState(false)
    const [audioError, setAudioError] = useState<string | null>(null);
    
    // DHIS2 Config
    const { baseUrl } = useConfig();
    
    // Dynamic music states
    const [mp3Files, setMp3Files] = useState([]);
    const [isLoadingMusic, setIsLoadingMusic] = useState(false);
    const [musicError, setMusicError] = useState(null);
  
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [slidesToShow, setSlidesToShow] = useState(1);
    const [delay, setDelay] = useState(2000);
    const [isPaused, setIsPaused] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    // Load audio files from DHIS2
    const loadAudioFiles = useCallback(async () => {
      setIsLoadingMusic(true);
      setMusicError(null);
      
      try {
        console.log('Loading audio files from DHIS2...');
        
        const response = await fetch(`${baseUrl}/api/fileResources?fields=*&paging=false`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load files: HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw file data for music:', data);

        // Filter only audio files
        const allFiles = data.fileResources || [];
        const audioFiles = allFiles.filter(file => 
          file.contentType && file.contentType.startsWith('audio/')
        );

        // Transform to match expected format with proper URL construction
        const transformedFiles = audioFiles.map(file => ({
          id: file.id,
          name: file.name || `Audio File ${file.id}`,
          // Use the file ID for the src, we'll construct the full URL when setting
          src: file.id,
          contentType: file.contentType,
          size: file.contentLength,
          // Store the display name for selection
          displayName: file.displayName || file.name
        }));

        console.log(`Loaded ${transformedFiles.length} audio files for background music`);
        setMp3Files(transformedFiles);

      } catch (err) {
        console.error('Failed to load audio files:', err);
        setMusicError(`Failed to load music files: ${err.message}`);
        // Fallback to empty array if loading fails
        setMp3Files([]);
      } finally {
        setIsLoadingMusic(false);
      }
    }, [baseUrl]);

    // Load audio files when component mounts
    useEffect(() => {
      loadAudioFiles();
    }, [loadAudioFiles]);

    useEffect(()=>{
      console.log("hello bog",dashboardMaps)
    },[dashboardMaps])
    
    // Combine visuals and maps
    const combinedData = [...dashboardData, ...(dashboardMaps || [])];

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

    // Enhanced audio loading function with format validation and conversion
    const loadAudioFromDHIS2 = useCallback(async (fileId: string): Promise<string> => {
      try {
        console.log(`Loading audio file: ${fileId}`);
        
        // Strategy 1: Try direct data endpoint with authentication headers
        try {
          const response = await fetch(`${baseUrl}/api/fileResources/${fileId}/data`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Authorization': localStorage.getItem('dhis2.auth') || '',
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            console.log('Retrieved blob:', {
              size: blob.size,
              type: blob.type
            });
            
            // Check if it's actually audio content
            if (blob.size > 0) {
              // Create audio URL regardless of detected type
              const audioUrl = URL.createObjectURL(blob);
              console.log(`Audio loaded successfully via direct endpoint: ${audioUrl}`);
              
              // Test if the browser can play this format
              const audio = new Audio();
              const canPlay = audio.canPlayType('audio/mpeg') || audio.canPlayType('audio/mp3');
              console.log('Browser audio format support:', {
                'audio/mpeg': audio.canPlayType('audio/mpeg'),
                'audio/mp3': audio.canPlayType('audio/mp3'),
                'audio/wav': audio.canPlayType('audio/wav'),
                'audio/ogg': audio.canPlayType('audio/ogg')
              });
              
              return audioUrl;
            }
          }
        } catch (directError) {
          console.log('Direct endpoint failed:', directError);
        }

        // Strategy 2: Try with external access parameter
        try {
          const response = await fetch(`${baseUrl}/api/fileResources/${fileId}/data?external=true`, {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            const blob = await response.blob();
            console.log('Retrieved blob via external:', {
              size: blob.size,
              type: blob.type
            });
            
            if (blob.size > 0) {
              const audioUrl = URL.createObjectURL(blob);
              console.log(`Audio loaded successfully via external access: ${audioUrl}`);
              return audioUrl;
            }
          }
        } catch (externalError) {
          console.log('External access failed:', externalError);
        }

        // Strategy 3: Try to update sharing settings first, then access
        try {
          console.log('Attempting to update sharing settings for file access...');
          
          // First get current sharing settings
          const sharingResponse = await fetch(`${baseUrl}/api/fileResources/${fileId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (sharingResponse.ok) {
            const fileData = await sharingResponse.json();
            
            // Update sharing to allow external access
            const updateResponse = await fetch(`${baseUrl}/api/fileResources/${fileId}`, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...fileData,
                sharing: {
                  ...fileData.sharing,
                  external: true,
                  publicAccess: 'r-------'
                }
              })
            });

            if (updateResponse.ok) {
              // Now try to access the data again
              const dataResponse = await fetch(`${baseUrl}/api/fileResources/${fileId}/data`, {
                method: 'GET',
                credentials: 'include',
              });

              if (dataResponse.ok) {
                const blob = await dataResponse.blob();
                console.log('Retrieved blob after sharing update:', {
                  size: blob.size,
                  type: blob.type
                });
                
                if (blob.size > 0) {
                  const audioUrl = URL.createObjectURL(blob);
                  console.log(`Audio loaded successfully after sharing update: ${audioUrl}`);
                  return audioUrl;
                }
              }
            }
          }
        } catch (sharingError) {
          console.log('Sharing update failed:', sharingError);
        }

        // Strategy 4: Use direct URL with session (last resort)
        console.log('All blob strategies failed, trying direct URL approach...');
        const directUrl = `${baseUrl}/api/fileResources/${fileId}/data`;
        return directUrl;
        
      } catch (error) {
        console.error(`Failed to load audio file ${fileId}:`, error);
        throw new Error(`Unable to access audio file: ${error.message}`);
      }
    }, [baseUrl]);

    // Function to update file sharing settings
    const updateFileSharing = useCallback(async (fileId: string) => {
      try {
        console.log(`Updating sharing settings for file: ${fileId}`);
        
        // Get current file metadata
        const response = await fetch(`${baseUrl}/api/fileResources/${fileId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to get file metadata: HTTP ${response.status}`);
        }

        const fileData = await response.json();
        
        // Update sharing settings to allow external access
        const updatedFileData = {
          ...fileData,
          sharing: {
            ...fileData.sharing,
            external: true,
            publicAccess: 'r-------', // Read access for public
          }
        };

        const updateResponse = await fetch(`${baseUrl}/api/fileResources/${fileId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFileData)
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.text();
          console.warn('Failed to update sharing settings:', errorData);
          return false;
        }

        console.log('Successfully updated sharing settings');
        return true;
        
      } catch (error) {
        console.warn('Error updating sharing settings:', error);
        return false;
      }
    }, [baseUrl]);

    // Enhanced track change handler with detailed audio format debugging
    const handleTrackChange = async (fileId: string) => {
      if (!fileId) return;
      
      setAudioError(null);
      setIsTrackPaused(true);
      
      try {
        // Clean up previous audio URL if it exists
        if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        // First attempt: try to update sharing settings
        await updateFileSharing(fileId);
        
        // Load the new audio file
        const audioUrl = await loadAudioFromDHIS2(fileId);
        
        if (audioRef.current) {
          // Reset audio element
          audioRef.current.src = '';
          audioRef.current.load();
          
          // Set up detailed error handling
          audioRef.current.onerror = (e) => {
            console.error('Audio playback error event:', e);
            const target = e.target as HTMLAudioElement;
            if (target && target.error) {
              const error = target.error;
              let errorMsg = 'Unknown audio error';
              
              switch (error.code) {
                case MediaError.MEDIA_ERR_ABORTED:
                  errorMsg = 'Audio playback aborted';
                  break;
                case MediaError.MEDIA_ERR_NETWORK:
                  errorMsg = 'Network error while loading audio';
                  break;
                case MediaError.MEDIA_ERR_DECODE:
                  errorMsg = 'Audio decoding error - file may be corrupted or invalid format';
                  break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                  errorMsg = 'Audio format not supported by browser';
                  break;
              }
              
              console.error('Detailed audio error:', {
                code: error.code,
                message: error.message,
                description: errorMsg
              });
              
              setAudioError(`${errorMsg} (Code: ${error.code})`);
            } else {
              setAudioError('Failed to play audio file');
            }
          };
          
          audioRef.current.onloadstart = () => {
            console.log('Audio load started');
          };
          
          audioRef.current.onloadedmetadata = () => {
            console.log('Audio metadata loaded:', {
              duration: audioRef.current?.duration,
              networkState: audioRef.current?.networkState,
              readyState: audioRef.current?.readyState
            });
          };
          
          audioRef.current.onloadeddata = () => {
            console.log('Audio data loaded successfully');
            setCurrentTrack(fileId);
          };
          
          audioRef.current.oncanplay = () => {
            console.log('Audio can start playing');
            setCurrentTrack(fileId);
          };
          
          audioRef.current.oncanplaythrough = () => {
            console.log('Audio can play through without buffering');
            setCurrentTrack(fileId);
          };
          
          audioRef.current.onended = () => {
            setIsTrackPaused(true);
          };
          
          // Set source and handle different URL types
          if (audioUrl.startsWith('http')) {
            audioRef.current.crossOrigin = 'use-credentials';
            audioRef.current.src = audioUrl;
          } else {
            // It's a blob URL
            audioRef.current.removeAttribute('crossOrigin');
            audioRef.current.src = audioUrl;
          }
          
          // Check browser support before loading
          const testAudio = new Audio();
          const formatSupport = {
            'audio/mpeg': testAudio.canPlayType('audio/mpeg'),
            'audio/mp3': testAudio.canPlayType('audio/mp3'),
            'audio/wav': testAudio.canPlayType('audio/wav'),
            'audio/ogg': testAudio.canPlayType('audio/ogg'),
            'audio/mp4': testAudio.canPlayType('audio/mp4'),
            'audio/aac': testAudio.canPlayType('audio/aac')
          };
          
          console.log('Browser audio format support:', formatSupport);
          
          // Load the audio
          audioRef.current.load();
          
          // Set a timeout to detect loading issues
          setTimeout(() => {
            if (audioRef.current && audioRef.current.readyState === 0) {
              console.warn('Audio not loading after 5 seconds');
              setAudioError('Audio loading timeout - check file format and accessibility');
            }
          }, 5000);
        }
        
      } catch (error) {
        console.error('Error setting up audio:', error);
        setAudioError(`Failed to load audio: ${error.message}`);
      }
    };
  
    const resetAudio = () => {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.currentTime = 0;
      }
    };

    // Function to play the audio
    const playAudio = () => {
      if (audioRef.current && audioRef.current.src && audioRef.current.readyState >= 2) {
        audioRef.current.play().then(() => {
          setIsTrackPaused(false);
        }).catch((error) => {
          console.error('Error playing audio:', error);
          setAudioError('Failed to play audio');
        });
      }
    };

    // Function to pause the audio
    const pauseAudio = () => {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.pause();
        setIsTrackPaused(true);
      }
    };

    // Function to stop the audio
    const stopAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Clean up blob URL
        if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        audioRef.current.src = '';
        setCurrentTrack(null);
        setIsTrackPaused(false);
        setAudioError(null);
      }
    };
  
    const togglePlayback = useCallback(() => {
      if (isPaused) {
        autoplayPlugin.current.play();
        playAudio();
      } else {
        autoplayPlugin.current.stop();
        pauseAudio();
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

    // Cleanup function
    useEffect(() => {
      return () => {
        // Clean up blob URLs when component unmounts
        if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      };
    }, []);

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
     ({i18n.t('Slide')} {currentSlide} {i18n.t('of')} {combinedData.length}) 
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
                    <Label htmlFor="slidesToShow" className="text-sm">{i18n.t('Slides')}</Label>
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
                    <Label htmlFor="delay" className="text-sm"> {i18n.t('Delay')}(ms)</Label>
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
                <div className="min-w-[280px]">
                  <Label className="text-sm flex items-center gap-2">
                    <Music2 className="" />
                    {i18n.t('Background Music')}
                    {isLoadingMusic && <RefreshCw className="w-3 h-3 animate-spin" />}
                    {mp3Files.length > 0 && (
                      <span className="text-xs text-green-600">({mp3Files.length} tracks)</span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Select 
                      value={currentTrack || ''} 
                      onValueChange={handleTrackChange}
                      disabled={isLoadingMusic || mp3Files.length === 0}
                    >
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue 
                          placeholder={
                            isLoadingMusic 
                              ? "Loading tracks..." 
                              : mp3Files.length === 0 
                                ? "No audio files found" 
                                : "Select a track"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {mp3Files.map((file) => (
                          <SelectItem key={file.id} value={file.src}>
                            {file.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={loadAudioFiles}
                      text=""
                      icon={<RefreshCw className={`h-4 w-4 ${isLoadingMusic ? 'animate-spin' : ''}`} />}
                      disabled={isLoadingMusic}
                      title="Refresh music library"
                    />
                    
                    <Button
                      onClick={async () => {
                        if (currentTrack) {
                          setAudioError('Updating permissions...');
                          const success = await updateFileSharing(currentTrack);
                          if (success) {
                            setAudioError('Permissions updated! Try playing again.');
                            setTimeout(() => setAudioError(null), 3000);
                          } else {
                            setAudioError('Failed to update permissions. Check console for details.');
                          }
                        }
                      }}
                      text="Fix"
                      icon={<RefreshCw className="h-4 w-4" />}
                      disabled={!currentTrack}
                      title="Update file sharing permissions"
                    />
                    
                    <Button
                      onClick={async () => {
                        if (!currentTrack) return;
                        
                        console.log('=== AUDIO DIAGNOSTIC START ===');
                        try {
                          // Test browser audio support
                          const testAudio = new Audio();
                          const formatSupport = {
                            'audio/mpeg': testAudio.canPlayType('audio/mpeg'),
                            'audio/mp3': testAudio.canPlayType('audio/mp3'),
                            'audio/wav': testAudio.canPlayType('audio/wav'),
                            'audio/ogg': testAudio.canPlayType('audio/ogg')
                          };
                          console.log('Browser format support:', formatSupport);
                          
                          // Test file accessibility
                          const response = await fetch(`${baseUrl}/api/fileResources/${currentTrack}/data`, {
                            method: 'GET',
                            credentials: 'include',
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            console.log('File info:', {
                              size: blob.size,
                              type: blob.type,
                              sizeInMB: (blob.size / 1024 / 1024).toFixed(2)
                            });
                            
                            // Try to read first few bytes to check format
                            const arrayBuffer = await blob.slice(0, 100).arrayBuffer();
                            const bytes = new Uint8Array(arrayBuffer);
                            const header = Array.from(bytes.slice(0, 10))
                              .map(b => b.toString(16).padStart(2, '0'))
                              .join(' ');
                            console.log('File header (first 10 bytes):', header);
                            
                            setAudioError(`File OK: ${blob.type}, ${(blob.size/1024/1024).toFixed(2)}MB. Header: ${header}`);
                          } else {
                            console.log('File access failed:', response.status, response.statusText);
                            setAudioError(`File access failed: ${response.status} ${response.statusText}`);
                          }
                          
                        } catch (error) {
                          console.error('Diagnostic error:', error);
                          setAudioError(`Diagnostic error: ${error.message}`);
                        }
                        console.log('=== AUDIO DIAGNOSTIC END ===');
                      }}
                      text="Test"
                      icon={<RefreshCw className="h-4 w-4" />}
                      disabled={!currentTrack}
                      title="Run audio diagnostic"
                    />
                    
                    <Button
                      onClick={resetAudio}
                      text=""
                      icon={<RotateCcw className="h-5 w-5" />}
                      disabled={!currentTrack}
                    />
                    
                    <Button
                      onClick={isTrackPaused ? playAudio : pauseAudio}
                      text="Track"
                      icon={isTrackPaused ? <FaPlay className="w-4 h-4" /> : <FaPause className="w-4 h-4" />}
                      disabled={!currentTrack}
                    />
                    
                    <Button
                      onClick={stopAudio}
                      text={i18n.t('Stop')}
                      variant="danger"
                      disabled={!currentTrack}
                    />
                  </div>
                  
                  {/* Music Error Display */}
                  {musicError && (
                    <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded">
                      {musicError}
                    </div>
                  )}
                  
                  {/* Audio Error Display */}
                  {audioError && (
                    <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded">
                      {audioError}
                    </div>
                  )}
                </div>
              </div>

                  {/* Presentation Controls */}
                  <div className="flex gap-2 items-end">
                <Button
                    onClick={togglePause}
                    text={i18n.t('Slides')}
                    icon={isPaused ? <FaPlay className="w-4 h-4" /> : <FaPause className="w-4 h-4" />}
                    aria-label={isPaused ? `${i18n.t('Play slideshow')}` : `${i18n.t('Pause slideshow')}`}
                  />
                  <Button
                    onClick={toggleFullscreen}
                    text={isFullscreen ? `${i18n.t('Exit Fullscreen')}`: `${i18n.t('FullScreen')}`}
                    icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
                  />

                  <Button
                    onClick={() => setIsPresentMode(false)}
                    text={i18n.t('Exit')} 
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
              {combinedData.map((item, index) => (
                <div
                  key={index}
                  className="flex-[0_0_auto] min-w-0 w-full h-full flex items-center"
                  style={{ 
                    width: `${100 / slidesToShow}%`, 
                    backgroundColor: item.visualType === "Gauge" ? '#ffffff' : (item.visualSettings?.backgroundColor || item.backgroundColor || '#ffffff')
                  }}
                >
                  <div className="w-full">
                    <h4 
                      className={`text-xl font-medium text-center bg-white ${
                        (!isFullscreen || showControls) ? "text-black" : "text-gray-400"
                      }`}
                    >
                      {index + 1}. {item.visualName || item.mapName}
                    </h4>

                    <div 
                      className="h-full" 
                      style={{
                        backgroundColor: item.visualType === "Gauge" ? '#ffffff' : (item.visualSettings?.backgroundColor || item.backgroundColor || 'transparent')
                      }} 
                    >
                      {/* Render either Visual Item or Map Item */}
                      {item.visualQuery ? (
                        <DashboardVisualItem
                          query={item.visualQuery}
                          dataSourceId={item.dataSourceId}
                          visualType={item.visualType}
                          visualSettings={item.visualSettings}
                          visualTitleAndSubTitle={item.visualTitleAndSubTitle}
                          analyticsPayloadDeterminer={item.analyticsPayloadDeterminer}
                        />
                      ) : (
                        <div  className=" h-[calc(100vh-50px)] " >
                             <SingleMapItem
                          geoFeaturesQuery={item.geoFeaturesQuery}
                          mapAnalyticsQueryOneQuery={item.mapAnalyticsQueryOneQuery}
                          mapAnalyticsQueryTwo={item.mapAnalyticsQueryTwo}
                            basemapType={item.BasemapType}
                           mapSettings={item.mapSettings}
                        />
                        </div>
                     
                      )}
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
              text={isPaused ? `${i18n.t('Play')}` : `${i18n.t('Pause')}`} 
              icon={isPaused ? <FaPlay className="w-4 h-4" /> : <FaPause className="w-4 h-4" />}
            />
            <Button
              onClick={toggleFullscreen}
              text={i18n.t('Exit Fullscreen')}
              icon={<Minimize2 className="w-4 h-4" />}
            />
          </div>
        )}
      </div>
      <audio 
        ref={audioRef} 
        className="hidden"
        preload="metadata"
        crossOrigin="use-credentials"
      />
    </div>
  );
};

export default PresentDashboard;