import React, { useEffect, useState } from 'react';
import sampleImage from 'url:./assets/sound.png';
import Header from './Header';
import Questions from './Questions';

function Listener() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [isClicked, setIsClicked] = useState(false);
  const [audioFile, setAudioFile] = useState(null); // State to store the audio file URL and name

  const fetchAudioAndQuestions = async () => {
    const user_id = localStorage.getItem('user_id'); // Retrieve the user ID from localStorage
    try {
      // Fetch audio first
      const audioResponse = await fetch('https://communication.theknowhub.com/api/listening_comprehension_audio', {
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
        const questionsResponse = await fetch('https://communication.theknowhub.com/api/listening_comprehension', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id }), // Pass user_id in the request body
        });

        const questionsData = await questionsResponse.json();

        if (questionsResponse.ok) {
          setQuestions(questionsData.questions);
        } else {
          setPopup({ message: 'Failed to fetch questions', type: 'error' });
          setTimeout(() => setPopup({ message: '', type: '' }), 3000);
        }
      } else {
        setPopup({ message: 'Issue fetching audio. Please try again', type: 'error' });
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      }
    } catch (error) {
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  useEffect(() => {
    fetchAudioAndQuestions();
  }, []);

  const handleClick = () => {
    const now = new Date();
    let currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    localStorage.setItem('duration', currentTime);
    setIsClicked(true); // Set isClicked to true
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} />
  
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[900px] h-auto flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-6">Listening Comprehension</h2>
        <p className="text-md mb-6">
          {loading
            ? 'Loading data, please wait...'
            : 'Listen to the audio carefully then answer the questions'}
        </p>
  
        {!isClicked && (
          <>
            <img
              src={sampleImage}
              alt="Prompt"
              className="mb-6 w-[100px] h-[100px] mx-auto rounded-lg"
            />
  
            {audioFile && (
              <div className="mb-6 w-full">
                <audio controls src={audioFile.url} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
  
            <div className="border-t border-gray-300 mb-8 w-full"></div>
  
            <button
              onClick={handleClick} // Call handleClick on button click
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
            >
              Generate Questions
            </button>
          </>
        )}
  
        {/* Render Questions component with questions */}
        {!loading && isClicked && <Questions questions={questions} />}
      </div>
  
      {popup.message && (
        <div
          className={`absolute top-20 p-4 rounded-lg text-white shadow-lg ${
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
