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
        if (sum != 0) { // Show only if there's a score
            setShowEmoji(true);
            setTimeout(() => {
                setShowEmoji(false); // Hide after 3 seconds
            }, 3000);
        }
    }, []);

    const handleRetry = async () => {
        localStorage.setItem('score', []);
        navigate('/level-tenses');
    };

    const handleContinue = async () => {
        localStorage.setItem('score', []);
        navigate('/home');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20 relative">
            <Header showNav={true} />
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center relative">
                <h2 className="text-xl font-bold mb-4">You achieved a score {totalScore} out of 5</h2>
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
                        Return To Home
                    </button>
                </div>
                
                {/* Emoji animation */}
                {showEmoji && (
                    <div className="emoji-slide-up">
                        {Array.from({ length: 30 }).map((_, index) => (
                            <span key={index} className="emoji">🎉</span>
                        ))}
                    </div>
                )}
            </div>

            {/* CSS for emoji slide-up animation */}
            <style>
                {`
                .emoji-slide-up {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    overflow: hidden;
                }

                .emoji {
                    position: absolute;
                    bottom: -50px;
                    font-size: 3rem;
                    animation: slide-up 3s linear infinite;
                }

                @keyframes slide-up {
                    0% {
                        transform: translateY(100vh);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-120vh);
                        opacity: 0;
                    }
                }

                .emoji {
                    left: calc(100% * var(--emoji-x));
                    animation-delay: calc(0.1s * var(--emoji-delay));
                }

                .emoji:nth-child(1) { --emoji-x: 0.1; --emoji-delay: 1; }
                .emoji:nth-child(2) { --emoji-x: 0.3; --emoji-delay: 1.5; }
                .emoji:nth-child(3) { --emoji-x: 0.5; --emoji-delay: 0.5; }
                .emoji:nth-child(4) { --emoji-x: 0.7; --emoji-delay: 2; }
                .emoji:nth-child(5) { --emoji-x: 0.9; --emoji-delay: 0.8; }
                .emoji:nth-child(6) { --emoji-x: 0.2; --emoji-delay: 0.3; }
                .emoji:nth-child(7) { --emoji-x: 0.4; --emoji-delay: 0.7; }
                .emoji:nth-child(8) { --emoji-x: 0.6; --emoji-delay: 1.2; }
                .emoji:nth-child(9) { --emoji-x: 0.8; --emoji-delay: 1.7; }
                .emoji:nth-child(10) { --emoji-x: 0.95; --emoji-delay: 1; }
                `}
            </style>
        </div>
    );
}

export default Final;
