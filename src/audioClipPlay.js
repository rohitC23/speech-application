import React, { useState, useRef, useEffect } from "react";
import play from 'url:./assets/play-button.svg';
import pause from 'url:./assets/pause-button.svg';
import './audioPlayer.css';

const CustomAudioPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    updateProgressBar(audioRef.current.currentTime);
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    updateProgressBar(newTime);
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
  }

  const updateProgressBar = (currentTime) => {
    const progress = (currentTime / duration) * 100;
    const progressBar = document.querySelector(".progress-range");
    if (progressBar) {
      progressBar.style.background = `linear-gradient(to right, #586fcc ${progress}%, #808080 ${progress}%)`;
    }
  };

  return (
    <div className="w-full mx-auto rounded-2xl p-2" style={{ backgroundColor: "#dfdfdf", borderRadius: "20px" }}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEndedTime}
      ></audio>

      <div
        className="flex items-center justify-between max-w-[1240px]">
        <div
            className="pr-2 pl-2 cursor-pointer"
          onClick={togglePlayPause}
        >
          <img src={isPlaying ? pause : play} width={14}/>
        </div>
        <div className="pr-2 text-sm">{formatTime(currentTime)}</div>
        <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full rounded-lg h-2 range-thumb progress-range"
        />
        <div
        // style={{
        //     width: "100px",
        //     fontSize: '14px'
        //  }}
         className="pl-2 pr-2 text-sm">{formatTime(duration)}</div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
