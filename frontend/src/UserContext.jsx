import React, { createContext, useState } from 'react';

// Create a context with an initial state. 
// This state can now be an object with isLoggedIn and a method to update it.
export const UserContext = createContext({
  isLoggedIn: false, // Initial state indicating the user is not logged in
  setIsLoggedIn: () => {} // Placeholder function, will be replaced in the provider
});

export function UserContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status
  const [userID, setUserID] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Value to be provided to the context consumers
  const contextValue = {
    isLoggedIn,
    setIsLoggedIn, // Function to update login status
    userID,
    setUserID,
    userRole,
    setUserRole
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
