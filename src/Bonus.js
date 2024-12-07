import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import backgroundImage from 'url:./assets/coins.jpg';

function Bonus() {
    const navigate = useNavigate();
    const handleContinue = () => {
        navigate("/level-para");
    };

    return (
        <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4 pt-20 relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <Header showNav={true} />
            <div className="flex flex-col justify-center items-center relative">
                <h2 className="text-5xl font-bold mb-4 text-white">
                Congratulations on entering the Bonus Level!
                </h2>
                <p className="text-white text-xl">This level includes reading comprehension and image description tasks</p>
                <div className="mt-12 flex">
                    <button
                        onClick={handleContinue}
                        className="bg-yellow-400 text-yellow-600 font-bold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Bonus;
