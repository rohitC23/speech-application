import React, { useRef, useState } from "react";
import audioPlay from 'url:./assets/Buttons (1).png';
import audioWave from 'url:./assets/sound__1_-0021-removebg-preview.png';
import audioWavegif from 'url:./assets/sound-unscreen.gif';

function AudioPlay({ audioFile }) {
  const audioPlayRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);

  const playAudio = () => {
    if (audioPlayRef.current) {
      setIsPlaying(true);
      setIsPlayed(true);
      audioPlayRef.current.play();
    }
  };

  const onAudioEnd = () => {
    setIsPlayed(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
  };

  return (
    <div>
      { !isPlaying && 
      <div className="w-60">
        <img
          src={audioPlay}
          onClick={playAudio}
          alt="Speak"
          className="mb-6 w-[100px] h-[100px] mx-auto rounded-lg cursor-pointer"
        />
      </div>
      }
      {
        isPlaying && 
        <div className="w-60">
        <div className="flex">
            <div className='my-9'>
              {formatTime(audioPlayRef.current?.currentTime)}
            </div>
            <div className="pl-3">
              {isPlayed}
              <img src={isPlayed ? audioWavegif : audioWave} style={{ height: '100px', width: '175px' }} />
            </div>
            <div className="my-9 pl-3">
              {formatTime(audioPlayRef.current?.duration)}
            </div>
        </div>
        <div className="columns-1 text-center">
          <a
            style={{ 
              cursor: 'pointer',
              textDecoration: 'underline',
              color: '#586FCC',
            }}
            onClick={playAudio}>Replay Again</a>
        </div>
        </div>
      }
      <audio ref={audioPlayRef} controls hidden src={audioFile} onEnded={onAudioEnd}>
      </audio>
    </div>
  )
}

export default AudioPlay;