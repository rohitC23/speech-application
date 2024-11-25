import React, { useState } from 'react';
import sampleImage from 'url:./assets/para.png';
import Header from './Header';
import Paragraph from './Paragraph';

function Generator() {
  const [hasStarted, setHasStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTopic, setUserTopic] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [popup, setPopup] = useState({ message: '', type: '' });

  const handleStartClick = async () => {
    const now = new Date();
    let currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    localStorage.setItem('duration', currentTime);
    if (!userTopic.trim()) {
      setPopup({ message: 'Please enter a topic', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      return;
    }
    
    setLoading(true);
    try {
      // Trigger the POST API when the Start button is clicked
      const response = await fetch('http://127.0.0.1:8000/generate_paragraph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: userTopic }), // Pass the userTopic as the API payload
      });
	  
	  const data = await response.json();

      // Check if the response is OK
      if (response.ok) {
        // Get the paragraph from the response
        const paragraph = data.paragraph;
        setParagraph(paragraph); // Store the paragraph in state
        
        setHasStarted(true); // Proceed to the next screen
      } else {
        setPopup({ message: 'Failed to generate paragraph', type: 'error' });
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      }
    } catch (error) {
      setPopup({ message: 'Failed to generate paragraph', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    } finally {
      setLoading(false); // Stop loading effect once the request is complete
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} />
      {!hasStarted ? (
        // Initial screen with instructions, image, info box, separator, and start button
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-6">Paragraph Generator</h2>

          {/* Centered Image */}
          <img src={sampleImage} alt="Prompt" className="mb-6 w-[100px] h-[100px] mx-auto rounded-lg" />
          <p className="text-md mb-6">Enter your desired topic and click on start to begin the test</p>

          {/* Input field for topic */}
          <input
            type="text"
            value={userTopic}
            onChange={(e) => setUserTopic(e.target.value)} // Update state with the input value
            placeholder="Enter a topic"
            className="px-4 py-2 border border-gray-300 rounded-lg mb-4 w-full"
          />

          {/* Gray line separator */}
          <div className="border-t border-gray-300 mb-8 w-full"></div>

          {/* Conditionally show loading text or Start button */}
          {loading ? (
            <p className="text-lg font-semibold text-blue-500">Generating paragraph, Please wait...</p>
          ) : (
            <button
              onClick={handleStartClick}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
            >
              Start
            </button>
          )}
        </div>
      ) : (
        <Paragraph paragraph={paragraph} />
      )}
      
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

export default Generator;
