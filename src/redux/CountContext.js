import React, { createContext, useContext, useState } from "react";

// Create a Context
const CountContext = createContext();

// Provide the Context to the application
export const CountProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const incrementCount = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const decrementCount = () => {
    setCount((prevCount) => Math.max(0, prevCount - 1));
  };

  const updateCount = (newCount) => {
    setCount(Math.max(0, newCount));
  };

  return (
    <CountContext.Provider
      value={{
        count,
        setCount: updateCount,
        incrementCount,
        decrementCount,
      }}
    >
      {children}
    </CountContext.Provider>
  );
};

export const useCount = () => {
  return useContext(CountContext);
};
