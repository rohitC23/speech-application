import React, { useState, useRef, useEffect } from 'react';
import talkImage from 'url:./assets/talk.png';
import NextSentence from './NextSentence';

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

function Sentences({ audioFile, question }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const user_id = localStorage.getItem('user_id');
  const timeoutRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement && audioFile) {
      audioElement.src = audioFile.url;
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) =>
          console.log('Audio playback prevented or failed:', error)
        );
      }
      setAudioURL('');
      setApiResponse(null);
    }
  }, [audioFile]);

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
    const audioChunks = [];
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      setAudioBlob(audioBlob);

      try {
        setIsLoading(true);
        const wavBlob = await convertToWav(audioBlob);
        const audioUrl = URL.createObjectURL(wavBlob);
        setAudioURL(audioUrl);

        const formData = new FormData();
        formData.append('index', 0);
        formData.append('user_id', user_id);
        formData.append('file', wavBlob, 'recording.wav');

        const response = await fetch('https://104.155.186.187:5000/evaluate_tense', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        setApiResponse(data);
        setIsLoading(false);

        if (data.Score !== undefined) {
          const currentScores = localStorage.getItem('score');
          let updatedScores = [];
        
          if (currentScores) {
            try {
              // Parse the existing scores and ensure it's an array
              updatedScores = JSON.parse(currentScores);
        
              // If parsing fails or result is not an array, reinitialize it as an array
              if (!Array.isArray(updatedScores)) {
                updatedScores = [];
              }
            } catch (error) {
              // Handle JSON parsing errors
              console.error('Error parsing scores from localStorage:', error);
              updatedScores = [];
            }
          }
        
          // Append the new score to the array
          updatedScores.push(data.Score);
        
          // Store the updated scores back in local storage
          localStorage.setItem('score', JSON.stringify(updatedScores));
        }

      } catch (error) {
        setIsLoading(false);
        console.error('Error uploading audio file:', error);
      }
    };
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
    mediaRecorderRef.current.stop();
    setIsStopped(true);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
      {!isStopped && (
        <>
          <h2 className="text-xl font-bold mb-4">Speak the correct sentence</h2>
          <p className="text-md mb-6">NOTE: {question}</p>
          <img
            src={talkImage}
            alt="Speak"
            className="mb-6 w-[100px] h-[100px] mx-auto rounded-lg"
          />
          <audio ref={audioRef} controls className="mb-4 w-full">
            <source src={audioFile?.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="mb-8 w-full"></div>

          {isRecording && (
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
              <p className="font-bold text-red-600">Recording...</p>
            </div>
          )}

          <div className="flex justify-between w-full max-w-[400px]">
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
          </div>
        </>
      )}

      {!isHidden && audioURL && (
        <div className="mt-6 w-full">
          <h2 className="text-lg font-semibold mb-2">Your Recorded Audio:</h2>
          <audio controls src={audioURL} className="w-full"></audio>
        </div>
      )}

      {!isHidden && apiResponse && (
        <div className="mt-6 w-full">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(apiResponse).map(([key, value], index) => (
              <div
                key={index}
                className="p-4 bg-gray-100 rounded-lg shadow-md"
              >
                <h3 className="font-bold">{key}:</h3>
                <p className="text-gray-700">{value}</p>
              </div>
            ))}
          </div>
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
        <p className="text-lg font-semibold text-blue-500 mt-4">
          Evaluating your answer...
        </p>
      )}

      {apiResponse && (
        <div className="w-full">
          <NextSentence setIsHidden={setIsHidden} id={1} />
        </div>
      )}
    </div>
  );
}

export default Sentences;

