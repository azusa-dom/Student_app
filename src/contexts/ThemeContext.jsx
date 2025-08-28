import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [backgroundStyle, setBackgroundStyle] = useState(() => localStorage.getItem('backgroundStyle') || 'classic');
  const [blurIntensity, setBlurIntensity] = useState(() => Number(localStorage.getItem('blurIntensity') || 2));
  const [transparency, setTransparency] = useState(() => Number(localStorage.getItem('transparency') || 10));

  const themes = {
    dark: {
      text: 'text-white',
      textSecondary: 'text-white/70',
      textMuted: 'text-white/40',
      card: `bg-white/${transparency} backdrop-blur-${blurIntensity}xl border-white/20`,
      cardHover: `hover:bg-white/${transparency + 5}`,
      button: 'bg-white text-gray-900 hover:bg-gray-50',
      buttonSecondary: `bg-white/${transparency} text-white border-white/20 hover:bg-white/20`,
      navigation: 'bg-white/5 border-white/10'
    },
    light: {
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-400',
      card: `bg-white/${80 + transparency} backdrop-blur-${blurIntensity}xl border-white/50`,
      cardHover: 'hover:bg-white/90',
      button: 'bg-gray-900 text-white hover:bg-gray-800',
      buttonSecondary: 'bg-white/70 text-gray-700 border-gray-200 hover:bg-white/80',
      navigation: 'bg-white/80 border-gray-100/50'
    }
  };

  const backgrounds = {
    classic: {
      dark: 'from-gray-900 via-gray-800 to-gray-900',
      light: 'from-slate-50 via-blue-50 to-indigo-100'
    },
    ocean: {
      dark: 'from-slate-900 via-blue-900 to-indigo-900',
      light: 'from-blue-50 via-sky-50 to-cyan-100'
    },
    forest: {
      dark: 'from-gray-900 via-emerald-900 to-green-900',
      light: 'from-emerald-50 via-green-50 to-teal-100'
    },
    sunset: {
      dark: 'from-gray-900 via-orange-900 to-red-900',
      light: 'from-orange-50 via-amber-50 to-yellow-100'
    },
    minimal: {
      dark: 'from-gray-900 to-gray-800',
      light: 'from-gray-50 to-white'
    }
  };

  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {};
      mediaQuery.addEventListener?.('change', handleChange);
      return () => mediaQuery.removeEventListener?.('change', handleChange);
    }
  }, [theme]);

  // 持久化设置
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('backgroundStyle', backgroundStyle);
  }, [backgroundStyle]);
  useEffect(() => {
    localStorage.setItem('blurIntensity', String(blurIntensity));
  }, [blurIntensity]);
  useEffect(() => {
    localStorage.setItem('transparency', String(transparency));
  }, [transparency]);

  const getCurrentTheme = () => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const getThemeConfig = () => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme];
  };

  const getBackgroundClass = () => {
    const currentTheme = getCurrentTheme();
    return `bg-gradient-to-br ${backgrounds[backgroundStyle][currentTheme]}`;
  };

  const value = {
    theme,
    setTheme,
    backgroundStyle,
    setBackgroundStyle,
    blurIntensity,
    setBlurIntensity,
    transparency,
    setTransparency,
    getCurrentTheme,
    getThemeConfig,
    getBackgroundClass,
    backgrounds: Object.keys(backgrounds),
    themes: Object.keys(themes).filter(t => t !== 'auto').concat(['auto'])
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
