import React, { useState } from 'react';
import sampleImage from 'url:./assets/Buttons.png';
import active from 'url:./assets/Vector.png';
import inactive from 'url:./assets/Icon.png';
import Header from './Header';
import Tenses from './Tenses';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';

function MainApp() {
  const [hasStarted, setHasStarted] = useState(false); // State to control the initial screen
  const [audioFile, setAudioFile] = useState(null); // State to store the audio file
  const [loading, setLoading] = useState(false); // State to handle loading
  const user_id = localStorage.getItem('user_id');
  const levelsList = JSON.parse(localStorage.getItem('levelsList'));
  const [popup, setPopup] = useState({ message: '', type: '' });
  const navigationMap = {
    "Correct the Sentences": '/app',
    "Correct the Tenses": '/level-tenses',
    "Listening Comprehension": '/level-listen',
    "Reading Comprehension": '/level-para',
    "Image Description": '/image',
  };

  const handleStartClick = async () => {
    setLoading(true);
    // Set the current time to 'duration' in localStorage
    const now = new Date();
    let currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    localStorage.setItem('duration', currentTime);

    try {
      // Trigger the POST API when the Start button is clicked
      const response = await fetch('https://communication.theknowhub.com/api/generate_sentences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 0, user_id: user_id }),
      });

      // Check if the response is OK
      if (response.ok) {
        // Get the file from the content-disposition header
        const blob = await response.blob(); // Extract the audio file as a blob
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
          : 'audio_file.mp3';

        const audioFileURL = URL.createObjectURL(blob); // Create a URL for the blob

        setAudioFile({ url: audioFileURL, name: filename }); // Store the file in state
        setHasStarted(true); // Proceed to the next screen
      } else {
        setPopup({ message: 'Issue with the server. Please try again', type: 'error' });
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      }
    } catch (error) {
      setPopup({ message: 'Issue with the server. Please try again', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    } finally {
      setLoading(false); // Stop loading effect once the request is complete
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gray-100 p-4 pt-20">
      <Header showNav={true} />
        <div className="flex items-center space-x-4 mb-10">
          {levelsList.map((level, index) => {
            // Get the corresponding route from the navigationMap
            const route = navigationMap[level];
            const isActive = level === "Correct the Sentences"; // Mark active based on string
  
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
        
        // Initial screen with instructions, image, info box, separator, and start button
        <div className="bg-gray-100 rounded-lg p-8 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-6">Correct the Sentences</h2>

          {/* Centered Image */}
          <img src={sampleImage} alt="Prompt" className="mb-6 w-[100px] h-[100px] mx-auto rounded-lg" />
          <p className="text-md">Pay close attention to the incorrect sentence, then take the time to</p>
          <p className="text-md mb-6">thoughtfully revise and correct it.</p>
          {/* Time and questions in a single box with a separator */}
          <div style={{ border: '1px solid #40508D', borderRadius: '16px' }} className="px-5 py-5 text-center shadow-sm justify-between items-center mb-8">
            {/* <div className='flex py-2 justify-center'>
              <p className="font-semibold">Time Per Sentence</p>:
              <p style={{ color: '#586FCC' }} className='pl-2'>30 seconds</p> */}
            {/* </div> */}
            {/* <div className="h-full mx-2"></div> Separator line */}
            <div className='flex py-2 justify-center'>
              <p className="font-semibold">Number of Sentences</p>:
              <p style={{ color: '#586FCC' }} className='pl-2'>5</p>
            </div>
          </div>

          {/* Gray line separator */}
          {/* <div className="border-t border-gray-300 mb-8 w-full"></div> */}

          {/* Conditionally show loading text or Start button */}
          {loading ? (
            <p className="text-lg font-semibold text-blue-500">Your test is about to begin, Hang Tight!</p>
          ) : (
            <button
              onClick={handleStartClick}
              style={{ backgroundColor: '#586FCC' }}
              className="px-8 py-3 hover:bg-blue-600 text-white font-semibold rounded-full text-lg w-48"
            >
              Start
            </button>
          )}
        </div>
      ) : (
        <Tenses audioFile={audioFile} /> // Pass audioFile as prop
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

export default MainApp;
