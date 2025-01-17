import React, { createContext, useContext, useState } from "react";

// Create a Context
const CountContext = createContext();

// Provide the Context to the application
export const CountProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
};

export const useCount = () => {
  return useContext(CountContext);
};
