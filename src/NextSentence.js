import React, { useState } from 'react';
import NewSentence from './NewSentence';

function NextSentence({ setIsHidden, id }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const user_id = localStorage.getItem('user_id');

  const handleNextClick = async () => {
    setLoading(true);
    try {      
  
        // API call to get the audio file
        const audioResponse = await fetch('https://104.155.186.187:5000/generate_tenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: id, user_id: user_id }),
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
          setIsHidden(true);
        } else {
          console.error('Failed to fetch audio file');
        }

        // API call to get the question
        const questionResponse = await fetch('https://104.155.186.187:5000/generate_question', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, user_id: user_id }),
          });
    
          if (questionResponse.ok) {
            const questionData = await questionResponse.json(); // Parse the JSON response
            setQuestion(questionData.question); // Set question from API response
          } else {
            console.error('Failed to fetch question');
          }
      } catch (error) {
      console.error('Error fetching audio file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!hasStarted ? (
        <div>
          <div className="mb-8 w-full"></div>

          {loading ? (
            <p className="text-lg font-semibold text-blue-500">
              Redirecting to the next audio, Please wait...
            </p>
          ) : (
            <button
              onClick={handleNextClick}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
            >
              Next
            </button>
          )}
        </div>
      ) : (
        audioFile ? (
          <NewSentence audioFile={audioFile} question={question}/>
        ) : (
          <p className="text-lg font-semibold text-blue-500">Loading audio...</p>
        )
      )}
    </div>
  );
}

export default NextSentence;
