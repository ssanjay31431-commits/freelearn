import React, { createContext, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Enforce dark mode permanently across all pages
    document.documentElement.classList.add('dark');
    localStorage.setItem('vf_theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: true, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};
