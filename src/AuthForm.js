import React, { useState } from 'react';
import Login from './Login'; // Import your Login component
import Signup from './Signup'; // Import your Signup component
import Header from './Header';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup

  // Function to toggle between login and signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={false} />
      <div className="bg-white p-8 rounded shadow-md w-96">
        <div className="flex justify-center mb-6">
          {/* Toggle buttons for switching between login and signup */}
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded-l-lg ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} transition-colors duration-300`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded-r-lg ${!isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} transition-colors duration-300`}
          >
            Signup
          </button>
        </div>

        {/* Conditionally render Login or Signup component */}
        {isLogin ? <Login /> : <Signup />}

        {/* Link to switch between forms */}
        <div className="mt-4 text-center">
          {isLogin ? (
            <>
              <p>
                Don't have an account?{' '}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={toggleForm}
                >
                  Signup now
                </span>
              </p>
            </>
          ) : (
            <>
              <p>
                Already have an account?{' '}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={toggleForm}
                >
                  Login
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
