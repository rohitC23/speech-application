import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://communication.theknowhub.com/api/assessment/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          usermail: email,
          password
        }),
      });

      const data = await response.json();

      if (response.ok && !data.Fail) {
        localStorage.setItem('user_id', data.user_id);
        setMessage('Signup successful! Redirecting...');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } else {
        setMessage(data.Fail || 'Signup failed. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    }

    setTimeout(() => {
      setMessage('');
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
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
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
            <button 
              type="button" 
              onClick={handlePasswordToggle} 
              className="absolute right-2 top-8" // Position the eye icon
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <i className="fa fa-eye" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-eye-slash" aria-hidden="true"></i>
              )}
            </button>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Sign Up</button>
        </form>

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
