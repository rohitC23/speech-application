import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Header from './Header';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [encodedOtp, setEncodedOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    resetForm();
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
    setIsLogin(false);
  };

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/assessment/otp/password', {
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
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/assessment/forgot/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usermail: email,
          userotp: otp,
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 pt-20">
      <Header showNav={false} />
      <div className="bg-white p-8 rounded shadow-md w-96">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => { setIsLogin(true); setIsForgotPassword(false); }}
            className={`px-4 py-2 rounded-l-lg ${isLogin && !isForgotPassword ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} transition-colors duration-300`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setIsForgotPassword(false); }}
            className={`px-4 py-2 rounded-r-lg ${!isLogin && !isForgotPassword ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} transition-colors duration-300`}
          >
            Signup
          </button>
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
                  <div className="mb-4">
                    <label className="block text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter new password"
                      required
                    />
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
                  className="w-full bg-blue-500 text-white py-2 rounded"
                >
                  Send OTP
                </button>
              )}
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
                    Signup now
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
              <p className="text-blue-500 cursor-pointer mt-2" onClick={handleForgotPasswordClick}>
                Forgot Password?
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
