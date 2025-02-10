import React, { useState, useRef, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import talkImage from 'url:./assets/talk.png';
import audioPlay from 'url:./assets/Buttons (1).png';
import recordAudio from 'url:./assets/Button (1).png';
import stopAudio from 'url:./assets/Button (2).png';
import audioWave from 'url:./assets/sound__1_-0021-removebg-preview.png';
import audioWavegif from 'url:./assets/sound-unscreen.gif';
import send from 'url:./assets/Button.png'
import NextButton from './NextButton'; 
import { Link, useNavigate } from 'react-router-dom';
import AudioPlay from './audioPlay';

function convertToWav(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      const audioContext = new AudioContext();
      audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        resolve(wavBlob);
      }, reject);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

function audioBufferToWav(buffer) {
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2 + 44;
  const result = new ArrayBuffer(length);
  const view = new DataView(result);
  const channels = [];
  let offset = 0;
  let pos = 0;

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChannels); // avg. bytes/sec
  setUint16(numOfChannels * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this example)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < numOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      pos += 2;
    }
    offset++;
  }

  return result;

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

function Tenses({ audioFile }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayed, setIsPlayed] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingTime , setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();
  const [showEmoji, setShowEmoji] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [audioTextInput, setAudioTextInput] = useState('');
  const user_id = localStorage.getItem('user_id');
  const [popup, setPopup] = useState({ message: '', type: '' });
  const timeoutRef = useRef(null);
  const aiEndpoint = process.env.REACT_APP_AI_ENDPOINT;

  useEffect(() => {
    const audio = audioRef.current;
    const updateCurrentTime = () => {
      setCurrentTime(audio.currentTime);
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateCurrentTime);
    }

    if (audio && audioFile) {
      audio.src = audioFile.url;
      // const playPromise = audioElement.play();
      // if (playPromise !== undefined) {
      //   playPromise.catch((error) =>
      //     console.log('Audio playback prevented or failed:', error)
      //   );
      // }
      setAudioURL('');
      setApiResponse(null);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', updateCurrentTime);
      }
    };
  }, []);

  const reloadAudio = () => {
    const audio = audioRef.current;
    const updateCurrentTime = () => {
      setCurrentTime(audio.currentTime);
    };
    if (audio) {
      audio.addEventListener('timeupdate', updateCurrentTime);
      audio.load();
    }
  }

  const startRecording = async () => {
    setIsRecording(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
    const audioChunks = [];
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    setRecordingTime(0); // Reset recording time
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1); // Increment time every second
    }, 1000);
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      setAudioBlob(audioBlob);
  
      try {
        // setErrorOccurred(false);
        setIsLoading(true);
        const wavBlob = await convertToWav(audioBlob);
        const audioUrl = URL.createObjectURL(wavBlob);
        setAudioURL(audioUrl);
  
        const formData = new FormData();
        formData.append('index', 0);
        formData.append('user_id', user_id);
        formData.append('file', wavBlob, 'recording.wav');
  
        const response = await fetch(`${aiEndpoint}/evaluate_sentence`, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) throw new Error('Failed to upload audio file');
  
        const data = await response.json();
        setApiResponse(data);
        setIsLoading(false);
  
        if (data.Score !== undefined) {
          const currentScores = localStorage.getItem('score');
          let updatedScores = currentScores ? JSON.parse(currentScores) : [];
          updatedScores.push(data.Score);
          localStorage.setItem('score', JSON.stringify(updatedScores));
        }
      } catch (error) {
        setIsLoading(false);
        setPopup({ message: 'No Audio captured. Please try again', type: 'error' });
        setIsClicked(false);
        setIsStopped(false);
        // setErrorOccurred(true);
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      }
    };
  };

  const handleMicrophonePermission = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // If permission is granted, start recording
      startRecording();
    } catch (error) {
      setPopup({ message: 'Allow microphone access to start recording.', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    }
  };
  
  const handleSendText = async () => {
    if (!audioTextInput.trim()) {
      setPopup({ message: 'Please enter a vaild text', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      return;
    }
  
    setIsClicked(true);
  
    try {
      // setErrorOccurred(false);
      setIsLoading(true);
  
      const response = await fetch(
        `${aiEndpoint}/evaluate_incorrect_answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_answer: audioTextInput,
            user_id,
            id: 0,
          }),
        }
      );
  
      if (!response.ok) throw new Error('Failed to evaluate the text');
  
      const data = await response.json();
      setApiResponse(data);
      setIsLoading(false);
  
      if (data.Score !== undefined) {
        const currentScores = localStorage.getItem('score');
        let updatedScores = currentScores ? JSON.parse(currentScores) : [];
        updatedScores.push(data.Score);
        localStorage.setItem('score', JSON.stringify(updatedScores));
      }
  
      // Display emoji based on response
      if (data.Score === 1) {
        setEmoji('🎉🎉 🎉🎉 🎉🎉');
      } else if (data.Score !== undefined) {
        setEmoji('🥲🥲 🥲🥲 🥲🥲');
      }
  
      setShowEmoji(true);
      timeoutRef.current = setTimeout(() => {
        setShowEmoji(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending text:', error);
      setIsLoading(false);
      setPopup({ message: 'Failed to evaluate the text.', type: 'error' });
      setIsClicked(false);
      setIsStopped(false);
      // setErrorOccurred(true);
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    }
  };

  useEffect(() => {
    if (apiResponse?.Score === 1) {
      setEmoji('🎉🎉 🎉🎉 🎉🎉');
    } else if (apiResponse?.Score !== undefined) {
      setEmoji('🥲🥲 🥲🥲 🥲🥲');
    } else {
      setShowEmoji(false);
      return;
    }

    // Show emoji and hide it after 3 seconds
    setShowEmoji(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear the previous timeout
    }
    timeoutRef.current = setTimeout(() => {
      setShowEmoji(false); // Hide after 3 seconds
    }, 3000);
    
    // Cleanup the timeout when the component unmounts or apiResponse changes
    return () => clearTimeout(timeoutRef.current);

  }, [apiResponse]);

  const stopRecording = () => {
    setIsRecording(false);
    console.log('mediaRecorderRef.current', mediaRecorderRef.current);
    mediaRecorderRef.current.stop();
    setIsStopped(true);
  };

  const handleTryAgain = () => {
    // navigate('/home');
    setAudioURL('');
    setAudioTextInput('');
    setIsStopped(false);
    setIsClicked(false);
    setIsPlaying(false);
    // setErrorOccurred(false);
    localStorage.setItem('score', []);
  };

  const playAudio = () => {
    if (audioRef.current) {
      reloadAudio();
      setIsPlaying(true);
      setIsPlayed(true);
      audioRef.current.play();
    }
  };

  const onAudioEnd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setIsPlayed(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
  };

  return (
    <div className="bg-gray-100 rounded-lg p-6 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
      {!isStopped && !isClicked && (
        <>
          <h2 className="text-2xl font-bold mb-10">
            Speak or type the correct sentence
          </h2>
          { !isPlaying && <img
            src={audioPlay}
            onClick={playAudio}
            alt="Speak"
            className="mb-6 w-[100px] h-[100px] mx-auto rounded-lg cursor-pointer"
          /> }
          {
            isRecording && (<div>
              <div className="text-md mb-4 text-center">
                <div className='flex'>
                  <div className='my-9' style={{ width: '35px' }}>
                    {formatTime(recordingTime)}
                  </div>
                  <div className='px-4'>
                    <img src={audioWavegif} style={{ height: '100px', width: '175px' }} />
                  </div>
                  <div>
                    <img onClick={stopRecording} className='pt-3 cursor-pointer' src={stopAudio} />
                  </div>
                </div>
                <a className="font-bold text-red-600">Recording...</a>
              </div>
            </div>)
          }
          {
            isPlaying && !isRecording && (<div>
              <div className="text-md mb-4 text-center">
                <div className='flex'>
                  <div className='my-9' style={{ width: '35px' }}>
                    {formatTime(currentTime)}
                  </div>
                  <div className='flex columns-10 text-center'>
                    
                    <div className='px-4'>{ isPlayed ? <img src={audioWavegif} style={{ height: '100px', width: '175px' }} /> : <img src={audioWave} style={{ height: '100px', width: '175px' }} /> }</div>
                    <div className='pt-3 cursor-pointer'><img onClick={handleMicrophonePermission} src={recordAudio} /></div>
                  </div>
                  {/* <div>
                    { isRecording && (<div>
                      {formatTime(recordingTime)} Recording...
                      <img onClick={stopRecording} src={stopAudio} /> </div>) }
                    
                  </div> */}
                </div>
                <a
                  style={{ 
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    color: '#586FCC', 
                  }}
                  onClick={playAudio}>Replay Again</a>
              </div>
            </div>)
          }
          <p className="text-md mb-6">Respond accurately to the prompt by speaking into the microphone or typing your answer.</p>
          <audio
            ref={audioRef}
            hidden
            onEnded={onAudioEnd} 
            controls 
            className="mb-4 w-full" 
            src={audioFile?.url}>
          </audio>
            {/* <source src={audioFile?.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio> */}
          <div className="w-full"></div>

          {/* {isRecording && (
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
              <p className="font-bold text-red-600">Recording...</p>
            </div>
          )} */}

          {/* <div className="flex justify-between w-full max-w-[400px]">
            <button
              onClick={startRecording}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isRecording
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              disabled={isRecording}
            >
              Start Recording
            </button>
            <button
              onClick={stopRecording}
              className={`px-6 py-2 rounded-lg font-semibold ${
                !isRecording
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              disabled={!isRecording}
            >
              Stop Recording
            </button>
          </div> */}
        </>
      )}

      {!isStopped && !isClicked && (
        <>  
          <div className="w-full">
          <p className="text-md mb-4 text-center">or</p>
            <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Enter your answer here"
              style={{ borderLeft: 'none', borderRight: 'none' }}
              className={`w-full border border-gray-300 bg-gray-100 py-4 px-4 text-gray-700 focus:outline-none ${
                isPlaying ? "" : "opacity-50 cursor-not-allowed"
              }`}
              value={audioTextInput}
              onChange={(e) => setAudioTextInput(e.target.value)}
              disabled={!isPlaying} // Disable input until audio starts playing
            />
              {/* <button
                onClick={handleSendText}
                className="absolute right-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none"
              > */}
              <img className="absolute right-2 text-white p-2 cursor-pointer" src={send} onClick={handleSendText} />
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-5 h-5"
              >
              <path fill="#ffffff"
                d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                transform="scale(0.8, 0.8) translate(0, 50)"
              />
              </svg> */}
              {/* </button> */}
            </div>
          </div>
          </>
      )}

      {!isHidden && apiResponse && audioURL && (
        <div className="mt-6 w-full">
          <h2 className="text-lg font-semibold mb-2">Your Recorded Audio:</h2>
          <AudioPlay audioFile={audioURL}></AudioPlay>
          {/* <audio controls src={audioURL} className="w-full"></audio> */}
        </div>
      )}

    {!isHidden && apiResponse && (
    <div className="mt-6 w-full">
      {/* Display other key-value pairs side by side */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(apiResponse).map(([key, value], index) =>
          !key.includes('Reason') ? (
            <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="font-bold">{key}:</h3>
              <p className="text-gray-700">{value}</p>
            </div>
          ) : null
        )}
      </div>
      {/* Display the Reason key-value pair in a single row */}
      {Object.entries(apiResponse).map(([key, value]) =>
        key.includes('Reason') ? (
          <div
            key={key}
            className="p-4 bg-gray-100 rounded-lg shadow-md border-2 border-blue-500 mt-8"
          >
            <h3 className="font-bold">{key}:</h3>
            <p className="text-gray-700">{value}</p>
          </div>
        ) : null
      )}
    </div>
    
    )}

      
      {/* Emoji animation */}
      {showEmoji && (
        <div className="absolute top-20 animate-slide-up text-6xl">
          {emoji}
        </div>
      )}

      {/* CSS for the slide-up animation */}
      <style>
        {`
          @keyframes slide-up {
            0% {
              transform: translateY(50px);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(-50px);
              opacity: 0;
            }
          }

          .animate-slide-up {
            animation: slide-up 3s ease-in-out;
          }
        `}
      </style>

      {!apiResponse && isStopped && isLoading && (
        <div className='bg-gray-100 w-[1000px] min-h-[560px] flex justify-center items-center'>
          <div>
            <DotLottieReact
              src="https://lottie.host/e5a9c9a7-01e3-4d75-ad9c-53e4ead7ab7c/ztelOlO7sv.lottie"
              loop
              autoplay
              style={{ width: '500px', height: '500px' }} // Customize size
            />
          </div>
      </div>
      )}


      {!apiResponse && isClicked && isLoading &&(
      <div className='bg-gray-100 w-[1000px] min-h-[560px] flex justify-center items-center'>
        <div>
          <DotLottieReact
            src="https://lottie.host/e5a9c9a7-01e3-4d75-ad9c-53e4ead7ab7c/ztelOlO7sv.lottie"
            loop
            autoplay
            style={{ width: '500px', height: '500px' }} // Customize size
          />
        </div>
      </div>
      )}

    {/* {errorOccurred && (
      <div className='flex flex-col items-center'>
        <p className="text-lg font-semibold text-red-500 mb-8">Oops! There seems to be an issue with the server. Please click on 'Try Again'</p>
        <button
          onClick={handleTryAgain}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
        >
          Try Again
        </button>
      </div>
    )} */}

      {apiResponse && (
        <div className="w-full">
          <NextButton setIsHidden={setIsHidden} id={1} />
        </div>
      )}

      {popup.message && (
        <div
          className={`fixed top-20 left-3/4 flex items-center justify-center max-w-md min-w-[200px] h-20 px-4 py-3 rounded-lg text-white shadow-lg break-words ${
            popup.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {popup.message}
        </div>
      )}

    </div>
  );
}

export default Tenses;

