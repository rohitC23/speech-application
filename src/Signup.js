import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTime, setOtpTime] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [encodedOtp, setEncodedOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const aiEndpoint = process.env.REACT_APP_AI_ENDPOINT;

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      setLoading(true);
      try {
        const fullName = `${firstName} ${lastName}`;
        const response = await fetch(`${aiEndpoint}/assessment/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usermail: email,
            password,
            full_name: fullName
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setOtpSent(true);
          setEncodedOtp(data.key);
          setMessage(data.message);
          setOtpTime(data.otptime);
          setIsSuccess(true);
        } else {
          setMessage(data.detail);
          setIsSuccess(false);
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        setMessage("An error occurred while sending OTP.");
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const fullName = `${firstName} ${lastName}`;
        const response = await fetch(
          `${aiEndpoint}/assessment/signup/validation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usermail: email,
              password,
              otp,
              otptime: otpTime,
              key: encodedOtp,
              full_name: fullName,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("user_id", data.user_id);
          const userId = localStorage.getItem("user_id");
          setMessage("Signup successful!");
          setIsSuccess(true);
          setTimeout(() => {
            navigate(`/home?user_id=${userId}`);
          }, 2000);
        } else {
          setMessage(data.message || "Signup failed. Please try again.");
          setIsSuccess(false);
        }
      } catch (error) {
        console.error("Error during signup:", error);
        setMessage("An error occurred. Please try again.");
        setIsSuccess(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <form onSubmit={handleSignUp}>
          {!otpSent && (
            <>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="firstName"
                >
                  First Name
                </label>
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
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
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
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
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
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
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
            </>
          )}

          {otpSent && (
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="otp"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-center items-center"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin text-white"></i>
            ) : otpSent ? (
              "Submit"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 text-center ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
