import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Paragraph({ questions }) {
  const [answers, setAnswers] = useState({}); // To store selected answers
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [canContinue, setCanContinue] = useState(false);
  const navigate = useNavigate();

  const handleOptionChange = (questionId, option) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const allAnswered = questions.every((_, index) => {
      const questionId = `question${index + 1}`;
      return answers[questionId];
    });

    if (!allAnswered) {
      setPopup({ message: 'Please submit all the answers', type: 'error' });
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
      return;
    }

    // Prepare payload
    const userAnswers = questions.map((_, index) => {
      const questionId = `question${index + 1}`;
      return answers[questionId];
    });

    const user_id = localStorage.getItem('user_id');
    const payload = {
      user_id,
      user_answers: userAnswers,
    };

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/evaluate_reading_comprehension',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }

      const result = await response.json();
      localStorage.setItem('totalScore', result.score);
      setPopup({ message: 'Answers submitted successfully!', type: 'success' });
      setCanContinue(true); // Enable the 'Continue' button
    } catch (error) {
      setPopup({ message: error.message || 'Something went wrong', type: 'error' });
    } finally {
      setTimeout(() => setPopup({ message: '', type: '' }), 3000);
    }

    // Retrieve initial 'duration' from local storage
    const initialDuration = localStorage.getItem('duration');

    // Get the current time as 'stop duration'
    const now = new Date();
    const stopDuration = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    localStorage.setItem('stopDuration', stopDuration);

    if (initialDuration) {
      // Extract hours, minutes, seconds from initialDuration and stopDuration
      const parseTime = (timeString) => {
        const [time, period] = timeString.split(" ");
        let [hours, minutes, seconds] = time.split(":").map(Number);
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return { hours, minutes, seconds };
      };

      const start = parseTime(initialDuration);
      const end = parseTime(stopDuration);

      // Calculate the difference in seconds
      let totalSeconds =
        (end.hours * 3600 + end.minutes * 60 + end.seconds) -
        (start.hours * 3600 + start.minutes * 60 + start.seconds);

      // Handle negative time difference if stopDuration is after midnight
      if (totalSeconds < 0) {
        totalSeconds += 24 * 3600;
      }

      // Convert totalSeconds back to hours, minutes, seconds
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Format total duration as HH:MM:SS
      const totalDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      localStorage.setItem('totalDuration', totalDuration);
    }

    // Call submitScore after ensuring totalDuration is set
    await submitScore();

  };

  const waitForTotalDuration = async () => {
    return new Promise((resolve) => {
      const checkDuration = () => {
        const totalDuration = localStorage.getItem('totalDuration');
        if (totalDuration) {
          resolve(totalDuration);
        } else {
          setTimeout(checkDuration, 100); // Check every 100ms
        }
      };
      checkDuration();
    });
  };

  const submitScore = async () => {
    const user_id = localStorage.getItem('user_id');
    const duration = await waitForTotalDuration(); // Wait for totalDuration to be available
    const level_number = 3;
    const score = localStorage.getItem('totalScore');;
    const durationInMinutes = duration;

    const requestBody = {
      user_id,
      level_number,
      score,
      duration: durationInMinutes,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/user/insert/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log('Score submitted successfully');
      } else {
        console.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };


  const handleContinueClick = () => {
    navigate('/level-listen');
  };

  return (
    <div className="w-full max-w-[900px] h-[550px] flex flex-col">
      <h2 className="text-xl font-bold mb-6">Answer the Questions</h2>

      {/* Questions Container with Vertical Scrolling */}
      <div className="overflow-y-auto w-full flex-grow">
        {questions.map((question, index) => {
          const questionId = `question${index + 1}`;
          return (
            <div key={questionId} className="mb-6 w-full">
              <p className="text-md font-semibold mb-4">{`${index + 1}. ${
                question[questionId]
              }`}</p>

              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={questionId}
                      value={option}
                      checked={answers[questionId] === option}
                      onChange={() => handleOptionChange(questionId, option)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons Section */}
      <div className="mt-6 flex justify-between items-center w-full">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-lg"
        >
          Submit Answers
        </button>
        <button
          className={`px-8 py-3 font-semibold rounded-lg text-lg ${
            canContinue
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!canContinue}
          onClick={handleContinueClick}
        >
          Continue
        </button>
      </div>

      {/* Popup Message */}
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

export default Paragraph;
