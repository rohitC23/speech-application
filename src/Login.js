import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State for displaying success or error messages
  const [isSuccess, setIsSuccess] = useState(null); // Track if the message is success or error
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page reload on form submission

    // API payload
    const loginData = {
      usermail: email,
      password: password,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/assessment/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json(); // Parse the response

      if (response.ok) {
        // If the response is successful, save user_id to localStorage
        localStorage.setItem('user_id', data.user_id);

        // Display a success message
        setMessage('Login successful!');
        setIsSuccess(true);

        // Wait for 3 seconds before navigating to the main page
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      } else {
        // If login fails, display an error message
        setMessage('Invalid credentials. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
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
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Login</button>
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

export default Login;
