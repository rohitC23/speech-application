import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import backgroundImage from "url:./assets/coins.jpg";

function Bonus() {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => setIsLoading(false);
    }, []);

    const handleContinue = () => {
        navigate("/level-para");
    };

    const handleSkip = () => {
        navigate("/home");
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4 pt-20"
        style={{ backgroundImage: `url(${backgroundImage})` }}>
            <Header showNav={true} hiddenNavItems={['/bonus']}/>
            <div
                className={`absolute inset-0 bg-gray-900 transition-opacity duration-500 ${
                    isLoading ? "opacity-50" : "opacity-0"
                }`}
            ></div>
            <div
                className={`relative z-10 transition-opacity duration-500 ${
                    isLoading ? "opacity-0" : "opacity-100"
                }`}
                
            >
                
                <div className="flex flex-col justify-center items-center relative">
                    <h2 className="text-5xl font-bold mb-4 text-white">
                        Welcome to the Bonus Level! Almost there!
                    </h2>
                    <p className="text-white text-xl">
                        This level includes reading comprehension and image description
                    </p>
                    <div className="mt-12 flex space-x-4">
                        <button
                            onClick={handleContinue}
                            className="bg-yellow-400 text-yellow-600 font-bold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                        >
                            Continue
                        </button>
                        <button
                            onClick={handleSkip}
                            className="bg-yellow-400 text-yellow-600 font-bold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                        >
                            Skip it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Bonus;
