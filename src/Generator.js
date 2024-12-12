import React, { useEffect, useState } from 'react';
import Header from './Header';
import Paragraph from './Paragraph';

function Generator() {
  const [loading, setLoading] = useState(false); // Initially not loading
  const [paragraph, setParagraph] = useState('');
  const [questions, setQuestions] = useState([]);
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [isClicked, setIsClicked] = useState(false);

  // Function to handle button click
  const handleClick = () => {
    setLoading(true); // Start loading on button click
    setIsClicked(true);
    const now = new Date();
    let currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    localStorage.setItem('duration', currentTime);
  };

  useEffect(() => {
    if (isClicked) {
      let isMounted = true; // Flag to track if the component is still mounted

      const fetchData = async () => {
        const user_id = localStorage.getItem('user_id'); // Retrieve the user ID from localStorage
        try {
          const response = await fetch('http://127.0.0.1:8000/reading_comprehension', {
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
    }
  }, [isClicked]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} hiddenNavItems={['/Home']}/>

      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[900px] h-auto flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">Reading Comprehension</h2>
        {!paragraph && questions.length === 0 && (
          <div> 
            <p className="text-md mb-6">Prepare yourself to understand paragraph and answer the related questions.</p>
            <p className="text-lg mb-2 font-bold">Instructions</p>
            <ul className="list-disc list-inside mb-6">
              <li>Carefully read the paragraph provided.</li>
              <li>Answer the questions based on your understanding.</li>
              <li>Use context clues.</li>
              <li>Build summary of the paragraph.</li>
            </ul>
          </div>
        )}

        <div className="border-t border-gray-300 mb-6 w-full"></div>

        {!isClicked && (
          <button
            onClick={handleClick}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
          >
            Start
          </button>
        )}

        {isClicked && loading && <p className="text-md mb-6">Loading data, please wait...</p>}

        {isClicked && !loading && (
          <>
            <p className="text-md mb-6">{paragraph}</p>
            <Paragraph questions={questions} />
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

export default Generator;
