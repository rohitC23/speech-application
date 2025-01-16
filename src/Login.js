import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const loginData = {
      usermail: email,
      password: password,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/assessment/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('level', data.current_level);
        
        // Retrieve the user ID from local storage
        const userId = localStorage.getItem('user_id');

        // Create the new status message that includes the user ID
        const statusMessage = `logged in as ${userId}`;

        // Store the new status message back in local storage
        localStorage.setItem('status', statusMessage);

        setMessage('Login successful!');
        setIsSuccess(true);

        setTimeout(() => {
          if (data.success === "Admin Logged in successfully") {
            navigate('/admin');
            return;
          }
          const level = localStorage.getItem("level");
          if (level) {
            if (level === 'Level 0' || level === 'Level 3' || level === 'Level 4' || level === 'Level 5') {
              navigate(`/home?user_id=${userId}`);
            } else {
              navigate('/home');
            }
          } else {
            setMessage('Unable to determine user level. Please contact support.');
            setIsSuccess(false);
          }
        }, 2000);

      } else {
        setMessage('Invalid credentials. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
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
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4 relative"> {/* Add relative positioning */}
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'} // Change input type based on state
              id="password"
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center mt-4"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              'Login'
            )}
          </button>
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

export default Login;
