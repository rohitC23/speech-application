import React, { useState } from 'react';
import Header from './Header';
import Questions from './Questions';

function Listener() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [isStarted, setIsStarted] = useState(false);
  const [audioFile, setAudioFile] = useState(null); // State to store the audio file URL and name

  const fetchAudioAndQuestions = async () => {
    const user_id = localStorage.getItem('user_id'); // Retrieve the user ID from localStorage
    try {
      // Fetch audio first
      const audioResponse = await fetch('http://127.0.0.1:8000/listening_comprehension_audio', {
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
        const questionsResponse = await fetch('http://127.0.0.1:8000/listening_comprehension', {
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
      setPopup({ message: 'An unexpected error occurred', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const startListening = () => {
    setIsStarted(true);
    fetchAudioAndQuestions();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} hiddenNavItems={['/Home']}/>
      <div className="flex items-center space-x-4 mb-10">
        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">1</div>
        <p className="text-green-500">Correct the Sentences</p>
        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">2</div>
        <p className="text-green-500">Correct the Tenses</p>
        <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center">3</div>
        <p className="text-blue-500">Listening Comprehension</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[900px] h-auto flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-6">Listening Comprehension</h2>
        
        {!audioFile &&(
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
          <>
            <button
              onClick={startListening}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
            >
              Start
            </button>
          </>
        ) : (
          <>
            <p className="text-md mb-6">
              {loading
                ? 'Loading data, please wait...'
                : 'Listen to the audio carefully then answer the questions'}
            </p>

            {audioFile && (
              <div className="mb-6 w-full">
                <audio controls src={audioFile.url} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {!loading && <Questions questions={questions} />}
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
