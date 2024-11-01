import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainApp from './MainApp'; 
import Home from './Home';
import ScoreBoard from './Scoreboard';
import AuthForm from './AuthForm';
import NextLevel from './NextLevel';
import Final from './Final';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} /> 
        <Route path="/app" element={<MainApp />} />
        <Route path="/" element={<AuthForm />} />=
        <Route path="/score-board" element={<ScoreBoard/>} />
        <Route path="/level-tenses" element={<NextLevel/>} />
        <Route path="/end" element={<Final/>} />
      </Routes>
    </Router>
  );
}

export default App;
