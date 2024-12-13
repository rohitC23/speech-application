import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';

function Header({ showNav, hiddenNavItems = [] }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isNavItemHidden = (path) => hiddenNavItems.includes(path);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <style jsx="true">{`
        .bonus-link {
          position: relative;
          display: inline-block;
          color: orange;
          background-image: linear-gradient(45deg, #f5c980, #f5a942, #f5a942, #f5c980);
          background-size: 300%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: glitter-animation 3s linear infinite, bounce-animation 1s ease-in-out infinite;
          transition: color 0.3s ease-in-out;
          text-shadow: 0 0 5px rgba(255, 215, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.4), 
                       0 0 15px rgba(255, 215, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.2);
        }
        
        .bonus-link:hover {
          color: #f5a942;
          text-shadow: 0 0 5px rgba(255, 215, 0, 0.7), 0 0 10px rgba(255, 215, 0, 0.6), 
                       0 0 15px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.4);
        }

        @keyframes glitter-animation {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }

        @keyframes bounce-animation {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md py-4 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-12 w-auto mr-2 pl-2" />
          </div>

          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>

          {showNav && (
            <nav className="hidden lg:flex items-center space-x-6 mr-2">
              {!isNavItemHidden('/Home') && (
                <Link 
                  to="/Home" 
                  className="text-gray-700 hover:text-blue-500 text-base font-medium"
                >
                  Home
                </Link>
              )}
              {!isNavItemHidden('/dashboard') && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-500 text-base font-medium"
                >
                  My Performance
                </Link>
              )}
              {!isNavItemHidden('/bonus') && (
                <Link 
                  to="/bonus" 
                  className="bonus-link text-base font-medium"
                >
                  Bonus Quest
                </Link>
              )}
              {!isNavItemHidden('/signout') && (
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-blue-500 text-base font-medium"
                  onClick={handleLogout}
                >
                  Sign Out
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {isMobileMenuOpen && showNav && (
        <div className="absolute top-16 right-0 w-64 bg-white shadow-md py-2 z-50">
          <div className="flex flex-col space-y-2">
            {!isNavItemHidden('/Home') && (
              <Link 
                to="/Home" 
                className="text-gray-700 hover:text-blue-500 text-base font-medium"
              >
                Home
              </Link>
            )}
            {!isNavItemHidden('/dashboard') && (
              <Link 
                to="/dashboard" 
                className="px-4 text-gray-700 hover:text-blue-500 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Performance
              </Link>
            )}
            {!isNavItemHidden('/bonus') && (
              <Link 
                to="/bonus" 
                className="bonus-link px-4 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bonus Quest
              </Link>
            )}
            {!isNavItemHidden('/signout') && (
              <Link 
                to="/" 
                className="px-4 text-gray-700 hover:text-blue-500 text-base font-medium"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Sign Out
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
