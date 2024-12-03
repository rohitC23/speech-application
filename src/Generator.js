import React, { useEffect, useState } from 'react';
import Header from './Header';
import Paragraph from './Paragraph';

function Generator() {
  const [loading, setLoading] = useState(true);
  const [paragraph, setParagraph] = useState('');
  const [questions, setQuestions] = useState([]);
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [isClicked, setIsClicked] = useState(false);

  // Function to handle button click
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

  useEffect(() => {
    let isMounted = true; // Flag to track if the component is still mounted
  
    const fetchData = async () => {
      const user_id = localStorage.getItem('user_id'); // Retrieve the user ID from localStorage
      try {
        const response = await fetch('https://communication.theknowhub.com/api/reading_comprehension', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id }), // Pass user_id in the request body
        });
  
        const data = await response.json();
  
        if (response.ok && isMounted) {
          // Set paragraph and questions from API response
          setParagraph(data.paragraph);
          setQuestions(data.questions);
        } else if (isMounted) {
          setPopup({ message: 'Failed to fetch data', type: 'error' });
          setTimeout(() => setPopup({ message: '', type: '' }), 3000);
        }
      } catch (error) {
        if (isMounted) {
          setPopup({ message: 'Failed to fetch data', type: 'error' });
          setTimeout(() => setPopup({ message: '', type: '' }), 3000);
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Stop loading spinner
        }
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false; // Set flag to false when the component unmounts
    };
  }, []);
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} />

      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[900px] h-auto flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-6">Reading Comprehension</h2>
        {!isClicked && (<p className="text-md mb-6">
          {loading
            ? 'Loading data, please wait...'
            : 'Read the paragraph carefully then answer the questions'}
        </p>)}

        {!isClicked && !loading && (
          <>
            <div className="border-t border-gray-300 mb-8 w-full"></div>
            <div>
              <p className="text-md mb-6">{paragraph}</p>
              <button
                onClick={handleClick} // Call handleClick on button click
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
              >
                Generate Questions
              </button>
            </div>
          </>
        )}

        {/* Render Paragraph component with questions */}
        {isClicked && <Paragraph questions={questions} />}
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

export default Generator;
