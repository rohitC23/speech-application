import React from "react";
import { useNavigate } from 'react-router-dom';

function Finish() {
  const navigate = useNavigate();

  const handleSubmitClick = async () => {
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
        // If successful, navigate to the score-board
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
