import React, { useState } from 'react';
import Header from './Header';
import Sentences from './Sentences';

function NextLevel() {
  const [hasStarted, setHasStarted] = useState(false); // State to control the initial screen
  const [difficultyLevel, setDifficultyLevel] = useState(null); // State to store difficulty level
  const [loading, setLoading] = useState(false); // State to handle loading
  const [question, setQuestion] = useState(null); // State to store question from API
  const [audioFile, setAudioFile] = useState(null); // State to store the audio file
  const user_id = localStorage.getItem('user_id');

  const handleStartClick = async () => {
    if (!difficultyLevel) {
      alert('Please select a difficulty level!');
      return;
    }

    setLoading(true);
    // Set the current time to 'duration' in localStorage
    const now = new Date();
    let currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    localStorage.setItem('duration', currentTime);
  
    try {
      // API call to get the audio file
      const audioResponse = await fetch('http://127.0.0.1:8000/generate_tenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 0, user_id: user_id, difficulty_level: difficultyLevel }),
      });

      if (audioResponse.ok) {
        const blob = await audioResponse.blob(); // Extract the audio file as a blob
        const contentDisposition = audioResponse.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
          : 'audio_file.mp3';

        const audioFileURL = URL.createObjectURL(blob); // Create a URL for the blob
        setAudioFile({ url: audioFileURL, name: filename }); // Store the file in state
        setHasStarted(true); // Proceed to the next screen
      } else {
        console.error('Failed to fetch audio file');
      }
      
      // API call to get the question
      const questionResponse = await fetch('http://127.0.0.1:8000/generate_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 0, user_id: user_id }),
      });

      if (questionResponse.ok) {
        const questionData = await questionResponse.json(); // Parse the JSON response
        setQuestion(questionData.question); // Set question from API response
      } else {
        console.error('Failed to fetch question');
      }
    } catch (error) {
      console.error('Error fetching question or audio file:', error);
    } finally {
      setLoading(false); // Stop loading effect once the request is complete
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} />
      {!hasStarted ? (
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-6">Speak in correct tense</h2>
          <p className="text-md mb-6">Choose a level to begin the test</p>

          {/* Three levels: easy, medium, and hard */}
          <div className="flex flex-col w-full mb-8 items-center">
            <div
              onClick={() => setDifficultyLevel('easy')}
              className={`text-2xl w-full font-medium py-3 cursor-pointer border rounded-lg px-6 mb-4 transition-all ${
                difficultyLevel === 'easy' ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              Easy
            </div>
            <div
              onClick={() => setDifficultyLevel('medium')}
              className={`text-2xl w-full font-medium py-3 cursor-pointer border rounded-lg px-6 mb-4 transition-all ${
                difficultyLevel === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-600' : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              Medium
            </div>
            <div
              onClick={() => setDifficultyLevel('hard')}
              className={`text-2xl w-full font-medium py-3 cursor-pointer border rounded-lg px-6 mb-4 transition-all ${
                difficultyLevel === 'hard' ? 'bg-red-100 border-red-500 text-red-600' : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              Hard
            </div>
          </div>

          {/* Conditionally show loading text */}
          {loading ? (
            <p className="text-lg font-semibold text-blue-500 mt-4">Your test is about to begin, Please wait...</p>
          ) : (
          <button
            onClick={handleStartClick}
            className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Start
          </button>)
          }
        </div>
      ) : (
        <Sentences audioFile={audioFile} question={question} /> // Pass both audioFile and question as props
      )}
    </div>
  );
}

export default NextLevel;
