import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from 'react-router-dom';

function Final() {
    const [totalScore, setTotalScore] = useState(0);
    const [showEmoji, setShowEmoji] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Get the score array from localStorage (assuming it's stored as a JSON string)
        const scoreArray = JSON.parse(localStorage.getItem('score')) || [];
        
        // Calculate the total score by summing all elements
        const sum = scoreArray.reduce((acc, score) => acc + score, 0);
        
        setTotalScore(sum);

        // Show the emoji for a few seconds
        if (sum === 0) { // Show only if there's a score
            setShowEmoji(true);
            setTimeout(() => {
                setShowEmoji(false); // Hide after 3 seconds
            }, 3000);
        }
    }, []);

    const handleRetry = () => {
        localStorage.setItem('score', []);
        navigate('/level-tenses');
    };

    const handleContinue = () => {
        localStorage.setItem('score', []);
        navigate('/home');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20 relative">
            <Header showNav={true} />
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center relative">
                <h2 className="text-xl font-bold mb-4">You achieved a score {totalScore} out of 50</h2>
                <div className="mt-6 flex space-x-4">
                    <button 
                        onClick={handleRetry}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Retry
                    </button>
                    <button 
                        onClick={handleContinue}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Return to Home
                    </button>
                </div>
                
                {/* Emoji animation */}
                {showEmoji && (
                    <div className="absolute top-20 animate-slide-up text-6xl">
                        🎉🎉 🎉🎉 🎉🎉
                    </div>
                )}
            </div>

            {/* CSS for the slide-up animation */}
            <style>
                {`
                @keyframes slide-up {
                    0% {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-50px);
                        opacity: 0;
                    }
                }

                .animate-slide-up {
                    animation: slide-up 3s ease-in-out;
                }
                `}
            </style>
        </div>
    );
}

export default Final;
