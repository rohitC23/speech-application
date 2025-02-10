import React, { useState } from 'react';
import Header from './Header';
import Sentences from './Sentences';
import active from 'url:./assets/Vector.png';
import inactive from 'url:./assets/Icon.png';
import { Link } from 'react-router-dom';
function NextLevel() {
  const [hasStarted, setHasStarted] = useState(false); // State to control the initial screen
  const [difficultyLevel, setDifficultyLevel] = useState(null); // State to store difficulty level
  const [loading, setLoading] = useState(false); // State to handle loading
  const [question, setQuestion] = useState(null); // State to store question from API
  const [audioFile, setAudioFile] = useState(null); // State to store the audio file
  const [popup, setPopup] = useState({ message: '', type: '' }); // State for popup message
  const user_id = localStorage.getItem('user_id');
  const levelsList = JSON.parse(localStorage.getItem('levelsList')) || [];
  const aiEndpoint = process.env.REACT_APP_AI_ENDPOINT;
  const navigationMap = {
    "Correct the Sentences": '/app',
    "Convert the Tenses": '/level-tenses',
    "Listening Comprehension": '/level-listen',
    "Reading Comprehension": '/level-para',
    "Image Description": '/image',
  };

  const handleStartClick = async () => {
    if (!difficultyLevel) {
      setPopup({ message: 'Please select a level!', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000); // Clear popup after 3 seconds
      return;
    }

    setLoading(true);
    const now = new Date();
    let currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    localStorage.setItem('duration', currentTime);

    try {
      // Fetch audio file
      const audioResponse = await fetch(`${aiEndpoint}/generate_tenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 0, user_id: user_id, difficulty_level: difficultyLevel }),
      });

      if (audioResponse.ok) {
        const blob = await audioResponse.blob();
        const contentDisposition = audioResponse.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
          : 'audio_file.mp3';

        const audioFileURL = URL.createObjectURL(blob);
        setAudioFile({ url: audioFileURL, name: filename });
        setHasStarted(true);
      } else {
        setPopup({ message: 'Failed to fetch audio', type: 'error' });
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      }

      // Fetch question
      const questionResponse = await fetch(`${aiEndpoint}/generate_question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 0, user_id: user_id }),
      });

      if (questionResponse.ok) {
        const questionData = await questionResponse.json();
        setQuestion(questionData.question);
      } else {
        setPopup({ message: 'Failed to fetch data', type: 'error' });
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      }
    } catch (error) {
      setPopup({ message: 'Error fetching data', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} />
      <div className="flex items-center space-x-4 mb-10">
        {levelsList.map((level, index) => {
          // Get the corresponding route from the navigationMap
          const route = navigationMap[level];
          const isActive = level === "Convert the Tenses"; // Mark active based on string

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
      {!hasStarted ? (
        <div className="rounded-lg p-8 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-6">Speak in correct tense</h2>
          <p className="text-md mb-6">Choose a level to begin the test</p>

          {/* Difficulty levels */}
          <div className="flex flex-col w-full mb-8 items-center">
            <div
              onClick={() => setDifficultyLevel('easy')}
              className={`text-2xl w-full font-medium py-3 cursor-pointer border rounded-lg px-6 mb-4 transition-all ${
                difficultyLevel === 'easy'
                  ? 'bg-green-100 border-green-500 text-green-600'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              Easy
            </div>
            <div
              onClick={() => setDifficultyLevel('medium')}
              className={`text-2xl w-full font-medium py-3 cursor-pointer border rounded-lg px-6 mb-4 transition-all ${
                difficultyLevel === 'medium'
                  ? 'bg-yellow-100 border-yellow-500 text-yellow-600'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              Medium
            </div>
            <div
              onClick={() => setDifficultyLevel('hard')}
              className={`text-2xl w-full font-medium py-3 cursor-pointer border rounded-lg px-6 mb-4 transition-all ${
                difficultyLevel === 'hard'
                  ? 'bg-red-100 border-red-500 text-red-600'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              Hard
            </div>
          </div>

          {loading ? (
            <p className="text-lg font-semibold text-blue-500 mt-4">
              Your test is about to begin, Hang Tight!
            </p>
          ) : (
            <button
              onClick={handleStartClick}
              className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Start
            </button>
          )}
        </div>
      ) : (
        <Sentences audioFile={audioFile} question={question} />
      )}

      {/* Popup for feedback */}
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

export default NextLevel;
