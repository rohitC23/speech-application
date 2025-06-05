import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const CustomAudioPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const speedOptions = [
    { value: 0.5, label: "0.5x" },
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "1x" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
  ];

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      updateProgressBar(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      updateProgressBar(newTime);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const onEndedTime = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    updateProgressBar(0);
  };

  const updateProgressBar = (currentTime) => {
    const progress = (currentTime / duration) * 100;
    const progressBar = document.querySelector(".progress-range");
    if (progressBar) {
      progressBar.style.background = `linear-gradient(to right, #586fcc ${progress}%, #586FCC61 ${progress}%)`;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [audioSrc]);

  return (
    <div className="w-full mx-auto rounded-2xl p-2" style={{ backgroundColor: "#dfdfdf", borderRadius: "20px" }}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEndedTime}
      />

      <div className="flex items-center justify-between max-w-[1240px] gap-2">
        <button
          className="pr-2 pl-2 cursor-pointer h-auto p-1 bg-transparent"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause size={14} className="text-gray-700" />
          ) : (
            <Play size={14} className="text-gray-700" />
          )}
        </button>

        <div className="pr-2 text-sm text-gray-700 min-w-[35px]">
          {formatTime(currentTime)}
        </div>

        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 rounded-lg h-2 range-thumb progress-range cursor-pointer"
          style={{
            background: `linear-gradient(to right, #586fcc 0%, #586FCC61 0%)`,
            outline: "none",
            appearance: "none",
          }}
        />

        <div className="pl-2 pr-2 text-sm text-gray-700 min-w-[35px]">
          {formatTime(duration)}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="text-xs px-2 py-1 h-auto bg-white/50 hover:bg-white/70 rounded-md border border-gray-300 flex items-center"
            style={{
              background: "rgb(223, 223, 223)",
              border: "none",
            }}>
              {speedOptions.find(option => option.value === playbackSpeed)?.label}
              <ChevronDown size={12} className="ml-1" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="min-w-[60px] bg-white border border-gray-200 shadow-lg z-50 rounded-md p-1"
            sideOffset={5}
          >
            {speedOptions.map((option) => (
              <DropdownMenu.Item
                key={option.value}
                onSelect={() => handleSpeedChange(option.value)}
                className={`text-sm px-3 py-1 cursor-pointer hover:bg-gray-100 rounded ${
                  playbackSpeed === option.value ? "bg-blue-50 text-blue-600" : ""
                }`}
              >
                {option.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <style>{`
        .range-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #586fcc;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .range-thumb::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #586fcc;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CustomAudioPlayer;
