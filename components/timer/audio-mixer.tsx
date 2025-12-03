"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Music,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: "music" | "ambiance";
  icon?: string;
}

// Using verified free ambient sounds
const AUDIO_SOURCES: AudioSource[] = [
  {
    id: "rain",
    name: "Rain Sound",
    description: "Cool droplets",
    url: "https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3",
    category: "ambiance",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    description: "Calming Beach",
    url: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
    category: "ambiance",
  },
  {
    id: "forest",
    name: "Forest Birds",
    description: "Nature Sounds",
    url: "https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3",
    category: "ambiance",
  },
  {
    id: "fire",
    name: "Campfire",
    description: "Crackling Flames",
    url: "https://assets.mixkit.co/active_storage/sfx/2396/2396-preview.mp3",
    category: "ambiance",
  },
  {
    id: "wind",
    name: "Wind Chimes",
    description: "Gentle Breeze",
    url: "https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3",
    category: "ambiance",
  },
  {
    id: "whitenoise",
    name: "White Noise",
    description: "Generated",
    url: "generated", // Will be generated using Web Audio API
    category: "ambiance",
  },
];

interface ActiveSound {
  id: string;
  volume: number;
  audio: HTMLAudioElement;
}

// Generate white noise using Web Audio API
function generateWhiteNoise(): HTMLAudioElement {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const bufferSize = 4096;
  const whiteNoise = audioContext.createScriptProcessor(bufferSize, 1, 1);
  
  whiteNoise.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  };
  
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.5;
  
  whiteNoise.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Create a fake audio element for compatibility
  const fakeAudio: any = {
    loop: true,
    volume: 0.5,
    play: () => Promise.resolve(),
    pause: () => {
      audioContext.suspend();
    },
    currentTime: 0,
    _gainNode: gainNode,
    _context: audioContext,
  };
  
  Object.defineProperty(fakeAudio, 'volume', {
    get: () => gainNode.gain.value,
    set: (val) => { gainNode.gain.value = val; },
  });
  
  return fakeAudio as HTMLAudioElement;
}

interface AudioMixerProps {
  variant?: "floating" | "inline";
}

export function AudioMixer({ variant = "floating" }: AudioMixerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeSounds, setActiveSounds] = React.useState<ActiveSound[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(true);

  const toggleSound = (sourceId: string) => {
    const exists = activeSounds.find((s) => s.id === sourceId);
    
    if (exists) {
      // Stop and remove sound
      exists.audio.pause();
      exists.audio.currentTime = 0;
      setActiveSounds((prev) => prev.filter((s) => s.id !== sourceId));
    } else {
      // Create and play new audio
      const source = AUDIO_SOURCES.find((s) => s.id === sourceId);
      if (!source) return;

      let audio: HTMLAudioElement;
      
      // Generate white noise or use regular audio
      if (source.url === "generated") {
        audio = generateWhiteNoise();
      } else {
        audio = new Audio(source.url);
        audio.loop = true;
        audio.volume = 0.5; // Default 50%
        
        // Play audio
        audio.play().catch((err) => {
          console.error("Audio play failed:", err);
        });
      }

      setActiveSounds((prev) => [...prev, { id: sourceId, volume: 50, audio }]);
    }
  };

  const updateVolume = (sourceId: string, volume: number) => {
    setActiveSounds((prev) =>
      prev.map((s) => {
        if (s.id === sourceId) {
          s.audio.volume = volume / 100;
          return { ...s, volume };
        }
        return s;
      })
    );
  };

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      activeSounds.forEach((sound) => {
        sound.audio.pause();
        sound.audio.currentTime = 0;
      });
    };
  }, []);

  const isActive = (sourceId: string) => {
    return activeSounds.some((s) => s.id === sourceId);
  };

  const getVolume = (sourceId: string) => {
    return activeSounds.find((s) => s.id === sourceId)?.volume ?? 50;
  };

  const ambianceSources = AUDIO_SOURCES.filter(
    (s) => s.category === "ambiance"
  );

  if (!isOpen) {
    if (variant === "inline") {
      return (
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="icon"
          className="relative"
          title="Audio Mixer">
          <Music className="h-5 w-5" />
          {activeSounds.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeSounds.length}
            </span>
          )}
        </Button>
      );
    }

    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="icon">
          <Music className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "z-50 w-96",
        variant === "inline" ? "fixed right-4 top-20" : "fixed right-4 bottom-4"
      )}>
      <Card className="bg-card/95 backdrop-blur-lg border-2 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-lg">Audio Mixer</h3>
            {activeSounds.length > 0 && (
              <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded-full">
                {activeSounds.length} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
            {/* Info */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
              🎵 Mix multiple sounds together for your perfect focus environment
            </div>

            {/* Ambiance Sounds */}
            <div className="space-y-3">
              {ambianceSources.map((source) => (
                <SoundControl
                  key={source.id}
                  source={source}
                  isActive={isActive(source.id)}
                  volume={getVolume(source.id)}
                  onToggle={() => toggleSound(source.id)}
                  onVolumeChange={(vol) => updateVolume(source.id, vol)}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

interface SoundControlProps {
  source: AudioSource;
  isActive: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

function SoundControl({
  source,
  isActive,
  volume,
  onToggle,
  onVolumeChange,
}: SoundControlProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all duration-200",
        isActive
          ? "bg-primary/10 border-primary/30"
          : "bg-muted/30 border-border hover:border-primary/20"
      )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <button
          onClick={onToggle}
          className="flex-1 text-left hover:opacity-80 transition-opacity">
          <div className="font-semibold text-sm">{source.name}</div>
          <div className="text-xs text-muted-foreground">
            {source.description}
          </div>
        </button>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0">
          {isActive ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Volume Slider */}
      {isActive && (
        <div className="flex items-center gap-2">
          <VolumeX className="h-3 w-3 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
          />
          <Volume2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}
