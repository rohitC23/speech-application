import React from "react";
import { useNavigate } from 'react-router-dom';

function Finish (){
  const navigate = useNavigate();
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
    const level_number = 2;
    const score = sum;
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

  const handleSubmitClick = async () => {
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

    // Retrieve user_id from local storage
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      console.error("User ID not found in local storage");
      return;
    }

    // Prepare the body for the POST request
    const requestBody = { user_id };

    try {
      // Send the POST request
      const response = await fetch('http://127.0.0.1:8000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Check if the response is successful
      if (response.ok) {
        
        navigate('/end');
      } else {
        console.error("Failed to submit: ", response.statusText);
      }
    } catch (error) {
      console.error("Error during API call: ", error);
    }
  };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="mb-8 w-full"></div>
            <button
              onClick={handleSubmitClick}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
            >
              Submit
            </button>
        </div>    
        
    );
}

export default Finish;
