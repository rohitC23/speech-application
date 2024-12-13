import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from 'react-router-dom';

function ScoreBoard() {
    const [totalScore, setTotalScore] = useState(0);
    const [showEmoji, setShowEmoji] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const scoreArray = JSON.parse(localStorage.getItem('score')) || [];
        const sum = scoreArray.reduce((acc, score) => acc + score, 0);
        
        setTotalScore(sum);

        // Show the emoji slide-up effect for a few seconds if the score is 0
        if (sum !== 0) {
            setShowEmoji(true);
            setTimeout(() => {
                setShowEmoji(false);
            }, 3000);
        }
    }, []);

    const handleRetry = async () => {
        localStorage.setItem('score', JSON.stringify([]));
        navigate('/app');
    };

    const handleContinue = async () => {
        localStorage.setItem('score', JSON.stringify([]));
        navigate('/level-tenses');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 pt-20 relative">
            <Header showNav={true} hiddenNavItems={['/Home']}/>
            <div className="flex items-center space-x-4 mb-12">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">1</div>
                <p className="text-blue-500">Correct the Sentences</p>
                <div className="bg-gray-300 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <i className="fas fa-lock" style={{ color: '#9CA3AF' }}></i>
                </div>
                <p className="text-gray-400">Correct the Tenses</p>
                <div className="bg-gray-300 w-8 h-8 rounded-full text-gray-400 flex items-center justify-center">
                    <i className="fas fa-lock" style={{ color: '#9CA3AF' }}></i>
                </div>
                <p className="text-gray-400">Listening Comprehension</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[900px] h-[550px] flex flex-col justify-center items-center relative">
                <h2 className="text-xl font-bold mb-4">Great job on your score of {totalScore} out of 5</h2>
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
                        Continue
                    </button>
                </div>
                
                {/* Emoji slide-up animation */}
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

export default ScoreBoard;
