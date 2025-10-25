import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, logout, getCurrentUser } from '../services/authService';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🤝 SkilLink
        </Link>

        {authenticated ? (
          <ul className="nav-menu">
            <li>
              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/search" 
                className={location.pathname === '/search' ? 'active' : ''}
              >
                Search
              </Link>
            </li>
            <li>
              <Link 
                to="/projects" 
                className={location.pathname === '/projects' ? 'active' : ''}
              >
                Projects
              </Link>
            </li>
            <li>
              <Link 
                to="/skills" 
                className={location.pathname === '/skills' ? 'active' : ''}
              >
                Skills
              </Link>
            </li>
            <li>
              <Link 
                to="/booking" 
                className={location.pathname === '/booking' ? 'active' : ''}
              >
                Bookings
              </Link>
            </li>
            <li className="nav-profile">
              <Link 
                to="/profile" 
                className={`profile-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="nav-avatar" />
                ) : (
                  <div className="nav-avatar-placeholder">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{user?.name || 'Profile'}</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <ul className="nav-menu">
            <li>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
