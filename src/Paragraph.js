import React, { useState, useRef } from 'react';
import talkImage from 'url:./assets/talk.png';
import { useNavigate } from 'react-router-dom';

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

function Paragraph({ paragraph }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const navigate = useNavigate();

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
        formData.append('paragraph', paragraph);
        formData.append('file', wavBlob, 'recording.wav');

        const response = await fetch('https://communication.theknowhub.com/api/evaluate_audio', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        setApiResponse(data);
        const overallScore = data["Overall Score"];
        const totalScore = overallScore.split('/')[0];
        localStorage.setItem('totalScore', totalScore);
        
        setIsLoading(false);
        setIsHidden(false);  // Unhide the audio and API response after processing

      } catch (error) {
        setIsLoading(false);
        console.error('Error uploading audio file:', error);
      }
    };
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    setIsStopped(true);
  };

  function formatApiResponse(responseText) {
    return responseText
      .replace(/(\*\*Score: \d+\/10\*\*)/g, '\n$1\n')  // Adds a new line around scores
      .replace(/\*/g, '')  // Removes all asterisks (*)
      .replace(/#/g, '')  // Removes all hash symbols (#)
      .trim();
  }

  const waitForTotalDuration = async () => {
    return new Promise((resolve) => {
      const checkDuration = () => {
        const totalDuration = localStorage.getItem('totalDuration');
        if (totalDuration) {
          resolve(totalDuration);
        } else {
          setTimeout(checkDuration, 100); // Check every 100ms
        }
      };
      checkDuration();
    });
  };

  const submitScore = async () => {
    const user_id = localStorage.getItem('user_id');
    const duration = await waitForTotalDuration(); // Wait for totalDuration to be available
    const level_number = 3;
    const score = localStorage.getItem('totalScore');;
    const durationInMinutes = duration;

    const requestBody = {
      user_id,
      level_number,
      score,
      duration: durationInMinutes,
    };

    try {
      const response = await fetch('https://communication.theknowhub.com/api/user/insert/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log('Score submitted successfully');
      } else {
        console.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };


  const handleContinueClick = async () => {
    // Retrieve initial 'duration' from local storage
    const initialDuration = localStorage.getItem('duration');

    // Get the current time as 'stop duration'
    const now = new Date();
    const stopDuration = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    localStorage.setItem('stopDuration', stopDuration);

    if (initialDuration) {
      // Extract hours, minutes, seconds from initialDuration and stopDuration
      const parseTime = (timeString) => {
        const [time, period] = timeString.split(" ");
        let [hours, minutes, seconds] = time.split(":").map(Number);
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return { hours, minutes, seconds };
      };

      const start = parseTime(initialDuration);
      const end = parseTime(stopDuration);

      // Calculate the difference in seconds
      let totalSeconds =
        (end.hours * 3600 + end.minutes * 60 + end.seconds) -
        (start.hours * 3600 + start.minutes * 60 + start.seconds);

      // Handle negative time difference if stopDuration is after midnight
      if (totalSeconds < 0) {
        totalSeconds += 24 * 3600;
      }

      // Convert totalSeconds back to hours, minutes, seconds
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Format total duration as HH:MM:SS
      const totalDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      localStorage.setItem('totalDuration', totalDuration);
    }

    // Call submitScore after ensuring totalDuration is set
    await submitScore();

    navigate('/image');
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
      {!isStopped && (
        <>
          <h2 className="text-xl font-bold mb-4">Speak the correct paragraph</h2>
          <p className="text-md mb-6">Read the paragraph below:</p>
          <img
            src={talkImage}
            alt="Speak"
            className="mb-6 w-[100px] h-[100px] mx-auto rounded-lg"
          />
          {/* Display the paragraph */}
          <div className="mb-8 w-full">
            <p className="text-md text-center">{paragraph}</p>
          </div>

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

      {/* Conditionally hide audio and response sections until processing is complete */}
      {!isHidden && (
        <>
          <div className="mt-6 w-full">
            <h2 className="text-lg font-semibold mb-2">Your Recorded Audio:</h2>
            <audio controls src={audioURL} className="w-full"></audio>
          </div>

          {apiResponse && (
            <div className="mt-6 w-full">
              <div className="grid gap-4">
                <div
                  style={{ maxHeight: '300px' }} // Adjust height as needed
                  className="overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-md"
                >
                  {Object.entries(apiResponse).map(([key, value], index) => (
                    <div key={index} className="mb-4">
                      <h3 className="font-bold">{key}:</h3>
                      <pre className="text-gray-700 whitespace-pre-line">
                        {formatApiResponse(value)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!apiResponse && isStopped && isLoading && (
        <p className="text-lg font-semibold text-blue-500 mt-4">
          Evaluating your answer...
        </p>
      )}

      {apiResponse && (
        <div className="flex flex-col justify-center items-center">
          <div className="mb-8 w-full"></div>
          <button
            onClick={handleContinueClick}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-lg"
          >
            Continue
          </button>
      </div>
      )}


    </div>
  );
}

export default Paragraph;
