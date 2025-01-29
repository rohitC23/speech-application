import React, { useState } from 'react';
import Header from './Header';
import Questions from './Questions';
import active from 'url:./assets/Vector.png';
import inactive from 'url:./assets/Icon.png';
import CustomAudioPlayer from './audioClipPlay';

function Listener() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const levelsList = JSON.parse(localStorage.getItem('levelsList'));
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [isStarted, setIsStarted] = useState(false);
  const [audioFile, setAudioFile] = useState(null); // State to store the audio file URL and name
  const [errorOccurred, setErrorOccurred] = useState(false); // State to track API errors
  const aiEndpoint = process.env.REACT_APP_AI_ENDPOINT;
  const navigationMap = {
    "Correct the Sentences": '/app',
    "Correct the Tenses": '/level-tenses',
    "Listening Comprehension": '/level-listen',
    "Reading Comprehension": '/level-para',
    "Image Description": '/image',
  };

  const fetchAudioAndQuestions = async () => {
    const user_id = localStorage.getItem('user_id'); // Retrieve the user ID from localStorage
    setErrorOccurred(false); // Reset error state before fetching
    try {
      // Fetch audio first
      const audioResponse = await fetch(`${aiEndpoint}/listening_comprehension_audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }), // Pass user_id in the request body
      });

      if (audioResponse.ok) {
        const blob = await audioResponse.blob(); // Extract the audio file as a blob
        const contentDisposition = audioResponse.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
          : 'audio_file.mp3';

        const audioFileURL = URL.createObjectURL(blob); // Create a URL for the blob
        setAudioFile({ url: audioFileURL, name: filename });

        // Fetch questions only after audio fetch is successful
        const questionsResponse = await fetch(`${aiEndpoint}/listening_comprehension`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id }), // Pass user_id in the request body
        });

        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setQuestions(questionsData.questions);
        } else {
          throw new Error('Failed to fetch questions');
        }
      } else {
        throw new Error('Issue fetching audio. Please try again');
      }
    } catch (error) {
      setPopup({ message: error.message, type: 'error' });
      setErrorOccurred(true);
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const startListening = () => {
    setIsStarted(true);
    fetchAudioAndQuestions();
    const now = new Date();
    let currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    localStorage.setItem('duration', currentTime);
  };

  const handleTryAgain = () => {
    setLoading(true); // Reset loading state before trying again
    fetchAudioAndQuestions(); // Retry fetching audio and questions
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} />
      <div className="flex items-center space-x-4 mb-10">
        {levelsList.map((level, index) => {
          // Get the corresponding route from the navigationMap
          const route = navigationMap[level];
          const isActive = level === "Listening Comprehension"; // Mark active based on string

          return (
            <React.Fragment key={index}>
              <div
                style={isActive ? { borderColor: '#586FCC' } : { }}
                className={`${
                  isActive ? 'border-500' : 'border-gray-500'
                } border-t-4 flex items-center space-x-2 w-96`}
                >
              <div>
                <img src={isActive ? active : inactive} alt="Prompt"/>
              </div>
              {/* <div
                className={`${
                  isActive ? 'bg-blue-500' : 'bg-gray-400'
                } text-white rounded-full w-8 h-8 flex items-center justify-center`}
              >
                {index + 1}
              </div> */}
              {route ? (
                <div
                  style={isActive ? { color: '#586FCC' } : { }}
                  className={`${
                    isActive ? 'text-500 w-auto' : 'text-gray-500 w-auto'
                  }`}
                >
                  {level}
                </div>
              ) : (
                <div
                  style={isActive ? { color: '#586FCC' } : { }}
                  className={`${
                    isActive ? 'text-500 w-auto' : 'text-gray-500 w-auto'
                  }`}
                >
                  {level}
                </div>
              )}
              </div>
            </React.Fragment>
          );
        })}
      </div>


      <div className="bg-gray-100 rounded-lg p-8 w-full max-w-[1240px] h-auto flex flex-col justify-content-left">
        <h2 className="text-2xl font-bold mb-6">Listening Comprehension</h2>
        
        {!audioFile && (
          <div> 
            <p className="text-md mb-6">Prepare yourself to listen to an audio clip and answer the related questions.</p>
            <p className="text-lg mb-2 font-bold">Instructions</p>
            <ul className="list-disc list-inside mb-6">
              <li>Carefully listen the audio provided.</li>
              <li>Answer the questions based on your understanding.</li>
              <li>Use context clues.</li>
              <li>Build summary of the audio.</li>
            </ul>
          </div>
        )}

        <div className="border-t border-gray-300 mb-6 w-full"></div>

        {!isStarted ? (
          <button
            onClick={startListening}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
          >
            Start
          </button>
        ) : (
          <>
            <p className="text-lg font-semibold text-blue-500">
              {loading &&( 'Preparing your Listening Comprehension exercise... Hang tight!')}
            </p>

            {audioFile && (
              <div className="mb-6 w-full">
                <p className="text-md mb-4 text-center">Listen to the audio carefully then answer the questions</p>
                {/* <audio controls src={audioFile.url} className="w-full">
                  Your browser does not support the audio element.
                </audio> */}
                <CustomAudioPlayer audioSrc={audioFile.url}></CustomAudioPlayer>
              </div>
            )}

            {/* Show questions if no error occurred */}
            {!loading && !errorOccurred && <Questions questions={questions} />}
            {/* Show "Try Again" button if error occurred */}
            {errorOccurred && (
              <button
                onClick={handleTryAgain}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
              >
                Try Again
              </button>
            )}
          </>
        )}
      </div>

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

export default Listener;
