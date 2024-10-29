import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State to store success or error message
  const [isSuccess, setIsSuccess] = useState(null); // State to track if the message is success or error
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      const response = await fetch('http://127.0.0.1:5000/assessment/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {

        // Display success message
        setMessage('Signup successful! Redirecting...');
        setIsSuccess(true);

        // Wait for 3 seconds before navigating to the home page
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      } else {
        // If signup fails, display an error message
        setMessage('Signup failed. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    }

    // Clear the message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Sign Up</button>
        </form>

        {/* Display message below the form */}
        {message && (
          <div className={`mt-4 text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
