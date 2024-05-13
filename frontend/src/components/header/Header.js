// Header.js

import React from 'react';
import styles from './header.module.css';
import { Link } from 'react-router-dom';
import { UserContext } from "../../UserContext.jsx";
import { useContext } from 'react';
import Logo from "./logo.webp";
import { useNavigate } from 'react-router-dom';


const Header = () => {
    const { isLoggedIn, setIsLoggedIn, userRole } = useContext(UserContext);
    const navigate = useNavigate(); // Hook to get the navigate function

    console.log("Logged in? ",isLoggedIn)

    const handleLogout = () => {
      console.log('User logged out');
      setIsLoggedIn(false);
      navigate('/');
    }

    return (
      <div className={styles.header}>
        <div><img className={styles.logo} src={Logo} alt='logo'></img></div>
        <div className={styles.title}>
          <h1> EVENT SPHERE</h1>
        </div>
        <div className={styles.nav}>
          <ul>
            <Link to='/' className={styles.list}>
              <li>
                Home
              </li>
            </Link>
            {isLoggedIn && userRole === 'organizer' && (
              <Link to='/create' className={styles.list}>
                <li>
                  Create
                </li>
              </Link>
            )}
            {isLoggedIn && (
              <Link to='/myevents' className={styles.list}>
                <li>
                  My Events
                </li>
              </Link>
            )}
            {!isLoggedIn && (
              <>
                <Link to='/login' className={styles.list}>
                  <li>
                    Login
                  </li>
                </Link>
                <Link to='/signup' className={styles.list}>
                  <li>
                    Sign Up
                  </li>
                </Link>
              </>
            )}
            {isLoggedIn && (
              <li className={styles.list} onClick={handleLogout}>
                Logout
              </li>
            )}
          </ul>
        </div>
      </div>
    );
};

export default Header;
