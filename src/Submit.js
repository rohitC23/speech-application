import React from "react";
import { useNavigate } from 'react-router-dom';



function Submit (){
  const navigate = useNavigate();
  const handleSubmitClick = async () => {
    navigate('/score-board');
  }
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="mb-8 w-full"></div>
            <button
              onClick={handleSubmitClick}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-lg"
            >
              Submit
            </button>
        </div>    
        
    );
}

export default Submit;