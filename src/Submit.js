import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

function Submit() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const aiEndpoint = process.env.REACT_APP_AI_ENDPOINT;
  const scoreArray = JSON.parse(localStorage.getItem('score')) || [];
  const sum = scoreArray.reduce((acc, score) => acc + score, 0);

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
    const level_number = 1;
    const score = sum;
    const durationInMinutes = duration;

    const requestBody = {
      user_id,
      level_number,
      score,
      duration: durationInMinutes,
    };

    try {
      const response = await fetch(`${aiEndpoint}/user/insert/score`, {
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

  const handleSubmitClick = async () => {
    setIsLoading(true); // Start loading spinner
    localStorage.setItem('bonusLevel', 1);
    const initialDuration = localStorage.getItem('duration');
    const now = new Date();
    const stopDuration = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    localStorage.setItem('stopDuration', stopDuration);

    if (initialDuration) {
      const parseTime = (timeString) => {
        const [time, period] = timeString.split(" ");
        let [hours, minutes, seconds] = time.split(":").map(Number);
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return { hours, minutes, seconds };
      };

      const start = parseTime(initialDuration);
      const end = parseTime(stopDuration);

      let totalSeconds =
        (end.hours * 3600 + end.minutes * 60 + end.seconds) -
        (start.hours * 3600 + start.minutes * 60 + start.seconds);

      if (totalSeconds < 0) {
        totalSeconds += 24 * 3600;
      }

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const totalDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      localStorage.setItem('totalDuration', totalDuration);
    }

    await submitScore();

    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      console.error("User ID not found in local storage");
      setIsLoading(false); // Stop loading spinner
      return;
    }

    const requestBody = { user_id };

    try {
      const response = await fetch(`${aiEndpoint}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        navigate('/score-board');
      } else {
        console.error("Failed to submit: ", response.statusText);
      }
    } catch (error) {
      console.error("Error during API call: ", error);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="mb-8 w-full"></div>
      <button
        onClick={handleSubmitClick}
        className={`px-8 py-3 ${isLoading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold rounded-lg text-lg flex items-center justify-center`}
        disabled={isLoading}
      >
        {isLoading ? (
          <i className="fas fa-spinner fa-spin text-white"></i>
        ) : (
          'Submit'
        )}
      </button>
    </div>
  );
}

export default Submit;
