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

        if (response.ok) {
          // Set paragraph and questions from API response
          setParagraph(data.paragraph);
          setQuestions(data.questions);
        } else {
          setPopup({ message: 'Failed to fetch data', type: 'error' });
          setTimeout(() => setPopup({ message: '', type: '' }), 3000);
        }
      } catch (error) {
        setPopup({ message: 'Failed to fetch data', type: 'error' });
        setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={true} />

      {/* Show loading message while fetching data */}
      {loading ? (
        <div className="text-lg font-semibold text-blue-500">Loading data, please wait...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[900px] h-auto flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-6">Reading Comprehension</h2>

          {/* Show paragraph if not clicked */}
          {!isClicked && (
            <div>
              <p className="text-md mb-6">{paragraph}</p>
              <button
                onClick={handleClick} // Call handleClick on button click
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
              >
                Generate Questions
              </button>
            </div>
          )}

          {/* Render Paragraph component with questions */}
          {isClicked && <Paragraph questions={questions} />}
        </div>
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
