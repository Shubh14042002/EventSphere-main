// Signup.js
import React, { useState } from 'react';
import styles from './signup.module.css';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('attendee');
  const [full_name, setFull_Name] = useState('');
  const navigate = useNavigate(); // Hook to get the navigate function

  // Update values for username, email, password, and confirm password
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleFullNameChange = (e) => {
    setFull_Name(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(role);
    // Temp
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);

    const user_info = {
      "username": username,
      "password": password,
      "email": email,
      "full_name": full_name,
      "role": role
    }
    try {
      const response = await fetch("http://localhost:3001/user/addUser", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(user_info)
      })

      if(!response.ok) {
        throw new Error("Error creating user");
      }
    } catch (err) {
      console.log(err.message);
    }

    //REDIRECTION:
    alert("Redirecting to the Login page.\n Use your new credentials to sign in.")
    
    //emptying after sign up
    setFull_Name('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    navigate("/login")
  };

  return (
    <div className={styles.signup}>
      <div className={styles.signupContainer}>
        <h1>Signup</h1>
    
        <form onSubmit={handleSubmit}>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" value={username} onChange={handleUsernameChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fullname">Full Name:</label>
            <input type="text" id="fullname" name="fullname" value={full_name} onChange={handleFullNameChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={email} onChange={handleEmailChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Role:</label>
            <select id="role" name="role" value={role} onChange={handleRoleChange} required>
              <option value="attendee">Attendee</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" value={password} onChange={handlePasswordChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
          </div>

          <div className={styles.loginLink}>
            Already have an account? <a href="/login">Login</a>
          </div>

          <button type="submit" className={styles.signupButton}>Signup</button>

        </form>
      
      </div>
    </div>
  );
}

export default Signup;
