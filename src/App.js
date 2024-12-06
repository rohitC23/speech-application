import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainApp from './MainApp'; 
import Home from './Home';
import ScoreBoard from './Scoreboard';
import AuthForm from './AuthForm';
import NextLevel from './NextLevel';
import Final from './Final';
import Generator from './Generator';
import Image from './Image';
import Dashboard from './Dashboard';
import Listener from './Listener';
import Welcome from './Welcome';
import Bonus from './Bonus';
import Admin from './Admin';

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
        <Route path='/level-para' element={<Generator/>} />
        <Route path='/image' element={<Image />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/level-listen' element={<Listener />} />
        <Route path='/welcome-back' element={<Welcome />} />
        <Route path='/bonus' element={<Bonus />} />
        <Route path='/admin' element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
