// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  const themes = {
    light: {
      navigation: 'bg-white/90 backdrop-blur-lg',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      card: 'bg-white/80',
      cardHover: 'hover:bg-white/90',
      button: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
      background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    },
    dark: {
      navigation: 'bg-gray-900/90 backdrop-blur-lg',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      card: 'bg-gray-800/80',
      cardHover: 'hover:bg-gray-700/80',
      button: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
      background: 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900'
    }
  };

  const getThemeConfig = () => {
    return themes[currentTheme];
  };

  const getBackgroundClass = () => {
    return themes[currentTheme].background;
  };

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    currentTheme,
    setCurrentTheme,
    getThemeConfig,
    getBackgroundClass,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;