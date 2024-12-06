import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';

function Header({ showNav }) {
  const navigate = useNavigate(); 

  // Function to handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md py-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-12 w-auto mr-2 pl-2" />
        </div>
        {/* Navigation Items */}
        {showNav && (
          <nav className="flex items-center space-x-6 mr-2">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-blue-500 text-base font-medium"
            >
              My Performance
            </Link>
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-500 text-base font-medium"
              onClick={handleLogout}
            >
              Sign Out
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
