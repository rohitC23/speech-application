import React, { useState, useRef, useEffect } from 'react';
import talkImage from 'url:./assets/talk.png';
import NextButton from './NextButton'; 

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
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [audioTextInput, setAudioTextInput] = useState('');
  const user_id = localStorage.getItem('user_id');
  const [popup, setPopup] = useState({ message: '', type: '' });
  const timeoutRef = useRef(null);

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
        setErrorOccurred(false);
        setIsLoading(true);
        const wavBlob = await convertToWav(audioBlob);
        const audioUrl = URL.createObjectURL(wavBlob);
        setAudioURL(audioUrl);
  
        const formData = new FormData();
        formData.append('index', 0);
        formData.append('user_id', user_id);
        formData.append('file', wavBlob, 'recording.wav');
  
        const response = await fetch('https://communication.theknowhub.com/api/evaluate_sentence', {
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
        setPopup({ message: 'Failed to evaluate the audio.', type: 'error' });
        setErrorOccurred(true);
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      }
    };
  };
  
  const handleSendText = async () => {
    if (!audioTextInput.trim()) {
      setPopup({ message: 'Please enter a vaild text', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      return;
    }
  
    setIsClicked(true);
  
    try {
      setErrorOccurred(false);
      setIsLoading(true);
  
      const response = await fetch(
        'https://communication.theknowhub.com/api/evaluate_incorrect_answer',
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
      setErrorOccurred(true);
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
    mediaRecorderRef.current.stop();
    setIsStopped(true);
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
      {!isStopped && !isClicked && (
        <>
          <h2 className="text-xl font-bold mb-4">Speak the correct sentence</h2>
          <p className="text-md mb-6">Hear the prompt, then say the right sentence or type the right sentence</p>
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

      {!isStopped && !isClicked && (
        <>  
          <div className="w-full mt-8">
          <p className="text-md mb-4 text-center">or</p>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Enter your answer here"
                className="w-full border border-gray-300 rounded-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={audioTextInput}
                onChange={(e) => setAudioTextInput(e.target.value)}
              />
              <button
                onClick={handleSendText}
                className="absolute right-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none"
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-5 h-5"
              >
              <path fill="#ffffff"
                d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                transform="scale(0.8, 0.8) translate(0, 50)"
              />
              </svg>
              </button>
            </div>
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

      {!apiResponse && isClicked && isLoading &&(
        <p className="text-lg font-semibold text-blue-500 mt-4">
          Evaluating your answer...
        </p>
      )}

    {errorOccurred && (
      <div className='flex flex-col items-center'>
        <p className="text-lg font-semibold text-red-500 mb-8">Oops! There seems to be an issue with the server. Please click on 'Try Again'</p>
        <button
          onClick={handleTryAgain}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
        >
          Try Again
        </button>
      </div>
    )}

      {apiResponse && (
        <div className="w-full">
          <NextButton setIsHidden={setIsHidden} id={1} />
        </div>
      )}

      {popup.message && (
        <div
          className={`fixed top-20 left-3/4 flex items-center justify-center w-80 h-20 m-auto rounded-lg text-white shadow-lg ${
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

