import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import login from './assets/login.mp4';
import logo from './assets/logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTime, setOtpTime] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [encodedOtp, setEncodedOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading
  const [showGoogleButton, setShowGoogleButton] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const aiEndpoint = process.env.REACT_APP_AI_ENDPOINT;
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsSignUp(!isSignUp);
    setShowGoogleButton(!isLogin);
    setIsForgotPassword(false);
    resetForm();
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
    setIsLogin(false);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  function handleGoogleSignup() {
    try {
        // Redirect the user to the backend's /login endpoint for Google OAuth
        window.location.href = `${aiEndpoint}/login`;
    } catch (error) {
        console.error("Error during Google signup:", error.message);
        alert("An error occurred during signup. Please try again later.");
    }
}


  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');

    setLoading(true); // Set loading to true before sending OTP

    try {
      const response = await fetch(`${aiEndpoint}/assessment/otp/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usermail: email }),
      });

      if (response.ok) {
        const data = await response.json();
        setEncodedOtp(data.encoded_otp);
        setOtpSent(true);
        setOtpMessage(data.Success);
        setOtpTime(data.otptime);
        setTimeout(() => {
          setOtpMessage('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setOtpMessage(errorData.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpMessage('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false); // Reset loading state after the operation
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${aiEndpoint}/assessment/forgot/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usermail: email,
          userotp: otp,
          otptime : otpTime,
          encoded_otp: encodedOtp,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Password reset successful!');
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/home');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Password reset failed. Please try again.');
        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrorMessage('Failed to reset password. Please try again.');
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    }
  };

  const resetForm = () => {
    setEmail('');
    setEmailError('');
    setOtp('');
    setNewPassword('');
    setOtpSent(false);
    setEncodedOtp('');
    setSuccessMessage('');
    setErrorMessage('');
    setOtpMessage('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 pt-20">
      <div className="flex-1 flex justify-center">
        <video 
          src={login} 
          autoPlay 
          loop 
          muted 
          className="rounded"
        />
      </div>

      <div className="flex-1 flex justify-center">
        <div className="bg-white p-8 rounded shadow-md w-96">

          <div className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-12 w-auto mx-auto mb-4" 
          />
        </div>

          {!isForgotPassword && (isLogin ? <Login /> : <Signup />)}

          {isForgotPassword && (
            <div>
              <h2 className="text-xl font-semibold text-center mb-4">Forgot Password</h2>
              <form>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your email"
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  {otpMessage && (
                    <p className={otpSent ? "text-green-500" : "text-red-500"}>{otpMessage}</p>
                  )}
                </div>

                {otpSent ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700">OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter OTP"
                        required
                      />
                    </div>
                    <div className="mb-4 relative">
                      <label className="block text-gray-700">New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter new password"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={handlePasswordToggle} 
                        className="absolute right-2 top-8"
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
                      type="button"
                      onClick={handleResetPassword}
                      className="w-full bg-blue-500 text-white py-2 rounded"
                    >
                      Reset Password
                    </button>
                    {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
                    {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full bg-blue-500 text-white py-2 rounded flex items-center justify-center mt-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                )}
                
                <div className="mt-4 text-center">
                  <p>
                    Having Trouble? Back to{' '}
                    <span className="text-blue-500 cursor-pointer" onClick={toggleForm}>
                      Login
                    </span>
                  </p>
                </div>
              </form>
            </div>
          )}

          <div className="mt-4 text-center">
            {!isForgotPassword && (
              <>
                {isLogin ? (
                  <p>
                    Don't have an account?{' '}
                    <span className="text-blue-500 cursor-pointer" onClick={toggleForm}>
                      Signup
                    </span>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <span className="text-blue-500 cursor-pointer" onClick={toggleForm}>
                      Login
                    </span>
                  </p>
                )}
                {!isSignUp && (
                  <p
                    className="text-blue-500 cursor-pointer mt-2"
                    onClick={handleForgotPasswordClick}
                  >
                    Forgot Password?
                  </p>
                )}

              </>
            )}
          </div>

        {!isForgotPassword && (
          <>
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-white text-blue border border-blue-500 py-2 rounded flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-6 w-6 mr-4"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.16 0 6.05 1.12 8.31 2.97l6.2-6.2C34.41 3.4 29.44 1.5 24 1.5 14.46 1.5 6.6 7.53 3.61 15.54l7.6 5.89C12.76 14.54 17.93 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.5 24c0-1.76-.16-3.46-.45-5.11H24v9.72h12.7c-.55 3.06-2.18 5.65-4.53 7.42l7.12 5.5c4.17-3.84 6.71-9.5 6.71-15.53z"
              />
              <path
                fill="#4A90E2"
                d="M24 46.5c6.03 0 11.11-1.99 15.02-5.39l-7.12-5.5c-2.1 1.41-4.8 2.24-7.9 2.24-6.07 0-11.24-4.96-12.3-11.39l-7.6 5.89c2.98 7.98 10.84 13.15 19.9 13.15z"
              />
              <path
                fill="#FBBC05"
                d="M3.61 15.54c-1.22 2.88-1.91 6.05-1.91 9.46s.69 6.58 1.91 9.46l7.6-5.89c-.62-1.86-.97-3.88-.97-6.06s.35-4.2.97-6.06l-7.6-5.89z"
              />
            </svg>
            Continue with Google
          </button>

          </>
        )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
