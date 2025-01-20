import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate } from 'react-router-dom'; // For programmatic navigation
import Header from './Header'; // Import the Header component
import hero from './assets/hero.png'; // Import the hero image
import { FaVolumeUp } from 'react-icons/fa'; // Import a speaker icon

function Home() {
  const [wordData, setWordData] = useState({ Word: '', Meaning: '', Example: '' });
  const [typedWord, setTypedWord] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audio] = useState(new Audio());
  const [apiResponse, setApiResponse] = useState(null); // To store API response
  const navigate = useNavigate();

  const location = useLocation();

    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const userId = queryParams.get("user_id");
  
      if (userId) {
        console.log("User ID:", userId); // Log only if userId is valid
        localStorage.setItem("user_id", userId);
        const statusMessage = `logged in as ${userId}`;
        localStorage.setItem("status", statusMessage);
      }
    }, [location.search]);

  const message = location.state?.message;

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        const popup = document.getElementById('popup-message');
        if (popup) popup.style.display = 'none';
      }, 3000); // Hide the popup after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/generate_word')
      .then((response) => response.json())
      .then((data) => {
        const today = Object.keys(data)[0];
        setWordData(data[today]);

        fetch('http://127.0.0.1:8000/generate_word_audio', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then((res) => res.blob())
          .then((audioBlob) => {
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            audio.src = url;
          });
      })
      .catch((error) => console.error('Error fetching the word of the day:', error));
  }, [audio]);

  useEffect(() => {
    let currentWord = `Word of the day: ${wordData.Word}`;
    let index = 0;
    if (wordData.Word) {
      const intervalId = setInterval(() => {
        setTypedWord(currentWord.slice(0, index + 1));
        index++;
        if (index === currentWord.length) {
          clearInterval(intervalId);
        }
      }, 100);
    }
  }, [wordData.Word]);

  const handlePlayAudio = () => {
    if (audioUrl) {
      audio.play();
    }
  };

  const handleBeginClick = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch('http://127.0.0.1:8000/levels_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      setApiResponse(data);
  
      // Store levelsList in localStorage
      localStorage.setItem('levelsList', JSON.stringify(data));
  
      // Mapping of levels to URLs
      const navigationMap = {
        "Correct the Sentences": '/app',
        "Correct the Tenses": '/level-tenses',
        "Listening Comprehension": '/level-listen',
        "Reading Comprehension": '/level-para',
        "Image Description": '/image',
      };
  
      const targetUrl = navigationMap[data[0]] || '/app'; // Default to '/app' if data[0] is not in the map
  
      // Navigate to the target URL
      navigate(targetUrl);
    } catch (error) {
      console.error('Error fetching levels list:', error);
    }
  };
  
  

  return (
    <div>
      <Header showNav={true} hiddenNavItems={['/Home']} />

      <section className="flex items-center justify-center h-screen bg-gray-100">
      {message && (
        <div
          id="popup-message"
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-md text-center"
        >
          {message}
        </div>
      )}
        <div className="container mx-auto flex flex-col md:flex-row items-center px-4 md:px-8">
          <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 md:-mt-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {typedWord}
              {audioUrl && (
                <FaVolumeUp
                  className="inline-block ml-4 cursor-pointer text-blue-500 hover:text-blue-600"
                  onClick={handlePlayAudio}
                />
              )}
            </h1>
            <p className="text-lg text-gray-600 mb-8 font-semibold">{wordData.Meaning}</p>
            <p className="text-lg text-gray-600 mb-8">{wordData.Example}</p>
            <button
              onClick={handleBeginClick}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Let's Begin
            </button>
          </div>

          <div className="w-full md:w-1/2 flex justify-center md:mt-10">
            <img src={hero} alt="Hero" className="w-full h-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
