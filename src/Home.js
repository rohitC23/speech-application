import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header'; // Import the Header component
import hero from './assets/hero.png'; // Import the hero image
import { FaVolumeUp } from 'react-icons/fa'; // Import a speaker icon

function Home() {
  // State to store the word of the day
  const [wordData, setWordData] = useState({ Word: '', Meaning: '' });
  const [typedWord, setTypedWord] = useState(''); // For the typing effect
  const [audioUrl, setAudioUrl] = useState(''); // For storing the audio URL
  const [audio] = useState(new Audio()); // Create a reusable audio instance
  
  // Fetch the word of the day when the component mounts
  useEffect(() => {
    fetch('https://communication.theknowhub.com/api/generate_word')
      .then((response) => response.json())
      .then((data) => {
        const today = Object.keys(data)[0]; // Get the date
        setWordData(data[today]); // Save the word data
        
        // Fetch the audio file for the word of the day
        fetch('https://communication.theknowhub.com/api/generate_word_audio', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
          .then((res) => res.blob())
          .then((audioBlob) => {
            const url = URL.createObjectURL(audioBlob); // Convert blob to object URL
            setAudioUrl(url); // Set the audio URL for playback
            audio.src = url; // Set the audio source
          });
      })
      .catch((error) => {
        console.error('Error fetching the word of the day:', error);
      });
  }, [audio]);

  // Typing effect for the word
  useEffect(() => {
    let currentWord = `Word of the day: ${wordData.Word}`;
    let index = 0;
    if (wordData.Word) {
      const intervalId = setInterval(() => {
        setTypedWord(currentWord.slice(0, index + 1));
        index++;
        if (index === currentWord.length) {
          clearInterval(intervalId); // Stop once fully typed
        }
      }, 100); // Adjust typing speed
    }
  }, [wordData.Word]);

  // Play the audio when the speaker icon is clicked
  const handlePlayAudio = () => {
    if (audioUrl) {
      audio.play();
    }
  };

  return (
    <div>
      {/* Header component */}
      <Header showNav={true} />

      {/* Hero section */}
      <section className="flex items-center justify-center h-screen bg-gray-100">
        <div className="container mx-auto flex flex-col md:flex-row items-center px-4 md:px-8">
          
          <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 md:-mt-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {typedWord} {/* Display the typed word */}
              {audioUrl && (
                <FaVolumeUp
                  className="inline-block ml-4 cursor-pointer text-blue-500 hover:text-blue-600"
                  onClick={handlePlayAudio}
                />
              )}
            </h1>
            <p className="text-lg text-gray-600 mb-8 font-semibold">
              {wordData.Meaning}
            </p>
            <p className="text-lg text-gray-600 mb-8">
              {wordData.Example}
            </p>
            <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
              <Link to="/app">Let's Begin</Link>
            </button>
          </div>

          {/* Hero image */}
          <div className="w-full md:w-1/2 flex justify-center md:mt-10">
            <img src={hero} alt="Hero" className="w-full h-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
