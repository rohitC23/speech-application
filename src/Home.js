import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header'; // Import the Header component
import hero from './assets/hero.png'; // Import the hero image

function Home() {
  // State to store the word of the day
  const [wordData, setWordData] = useState({ Word: '', Meaning: '' });
  // State to store the current typed text
  const [typedWord, setTypedWord] = useState('');
  
  // Fetch the word of the day when the component mounts
  useEffect(() => {
    fetch('https://communication.theknowhub.com/api/generate_word')
      .then((response) => response.json())
      .then((data) => {
        // Assuming the structure from the API response
        const today = Object.keys(data)[0]; // "2024-10-29"
        setWordData(data[today]);
      })
      .catch((error) => {
        console.error('Error fetching the word of the day:', error);
      });
  }, []);

  // Typing effect for the Word
  useEffect(() => {
    let currentWord = `Word of the day: ${wordData.Word}`;
    let index = 0;
    if (wordData.Word) {
      const intervalId = setInterval(() => {
        setTypedWord(currentWord.slice(0, index + 1));
        index++;
        if (index === currentWord.length) {
          clearInterval(intervalId); // Stop the typing once the word is fully typed
        }
      }, 100); // Change the delay as needed for faster/slower typing
    }
  }, [wordData.Word]); // Run the effect whenever the word changes

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
            </h1>
            <p className="text-lg text-gray-600 mb-8 font-semibold">
              {wordData.Meaning}
            </p>
            <p className="text-lg text-gray-600 mb-8">
              {wordData.Example}
            </p>
            <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
              <Link to="/app">
                Let's Begin
              </Link>
            </button>
          </div>

          {/* Hero image on the right, slightly moved down */}
          <div className="w-full md:w-1/2 flex justify-center md:mt-10">
            <img src={hero} alt="Hero" className="w-full h-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
