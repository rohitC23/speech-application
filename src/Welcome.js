import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import backgroundImage from 'url:./assets/background.jpg';

function Welcome() {
    const navigate = useNavigate();
    const level = localStorage.getItem("level");

    const handleRetry = () => {
        navigate("/home");
    };

    const handleContinue = () => {
        switch (level) {
            case "Level 0":
                navigate("/home");
                break;
            case "Level 1":
                navigate("/level-tenses");
                break;
            case "Level 2":
                navigate("/level-listen");
                break;
            case "Level 3":
                navigate("/bonus");
                break;
            case "Level 4":
                navigate("/image");
                break;
            case "Level 5":
                navigate("/home");
                break;
            default:
                navigate("/home"); // Fallback route
                break;
        }
    };

    return (
        <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4 pt-20 relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <Header showNav={true} />
            <div className="flex flex-col justify-center items-center relative">
                <h2 className="text-5xl font-bold mb-4 text-white">
                Congratulations on completing {level}!
                </h2>
                <p className="text-white text-xl">Would you like to continue or start over?</p>
                <div className="mt-12 flex space-x-12">
                    <button
                        onClick={handleRetry}
                        className="bg-orange-500 text-white font-bold px-6 py-3 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        Start Over
                    </button>
                    <button
                        onClick={handleContinue}
                        className="bg-yellow-500 text-white font-bold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;
