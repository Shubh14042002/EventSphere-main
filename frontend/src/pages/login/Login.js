// Login.js
import React, { useState, useEffect } from 'react';
import styles from './login.module.css';
import { UserContext } from "../../UserContext.jsx";
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useContext(UserContext);
  const { userID, setUserID } = useContext(UserContext);
  const { userRole, setUserRole } = useContext(UserContext);
  const navigate = useNavigate(); // Hook to get the navigate function


  //Just validating the state in the console after its changed
  useEffect(() => {
    console.log("userID has changed to:", userID);
  }, [userID]); // Dependency array with userID

  useEffect(() => {
    console.log("userRole has changed to:", userRole);
  }, [userRole]); // Dependency array with userID

  // Update login values
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  //handling the logic after the submit/create event button is clicked
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Temporary
    console.log('Username:', username);
    console.log('Password:', password);

    const credentials = {
      "username": username,
      "password": password
    }

    let data;

    try {
      const response = await fetch("http://localhost:3001/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      //parsing the response object
      data = await response.json();
      console.log("The id is: ", data.id);
      console.log("The role is: ", data.role)

      if(!response.ok) {
        throw new Error('Error checking for user');
      }

    } catch(err) {
      console.log(err.message);
    }

    if(data && (data.userFound === true)) {
      setIsLoggedIn(true);
      setUserID(data.id);
      setUserRole(data.role);
      navigate('/myevents');   //takes the user to their myevents page right after logging in.
    } else {
      setIsLoggedIn(false);
      alert("Incorrect Username or Password! Please try again.");
    }

    //making it empty
    setUsername('');
    setPassword('');
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={styles.login}>
      <div className={styles.loginContainer}>
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username: </label>
            <input type="text" id="username" name="username" value={username} onChange={handleUsernameChange} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password: </label>
            <input type="password" id="password" name="password" value={password} onChange={handlePasswordChange} />
          </div>

          <div className={styles.signupLink}>
            Don't have an account? <a href="/signup">Signup</a>
          </div>

          <div className={styles.forgotPasswordLink}>
            <button type="button" onClick={handleForgotPasswordClick} className={styles.forgotPasswordButton}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className={styles.loginButton}>Login</button>

        </form>
      </div>
    </div>

  );
}

export default Login;
