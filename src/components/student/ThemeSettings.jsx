import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSettings = () => {
  const {
    theme,
    setTheme,
    backgroundStyle,
    setBackgroundStyle,
    backgrounds,
    themes,
    getThemeConfig
  } = useTheme();

  const themeConfig = getThemeConfig();

  return (
    <div className={`space-y-6`}>
      <div className={`rounded-xl p-4 border ${themeConfig.card}`}>
        <h3 className={`text-lg font-medium mb-3 ${themeConfig.text}`}>主题</h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                theme === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
              }`}
            >
              {t === 'light' ? '浅色' : t === 'dark' ? '深色' : '自动'}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-xl p-4 border ${themeConfig.card}`}>
        <h3 className={`text-lg font-medium mb-3 ${themeConfig.text}`}>背景</h3>
        <div className="grid grid-cols-3 gap-2">
          {backgrounds.map(bg => (
            <button
              key={bg}
              onClick={() => setBackgroundStyle(bg)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                backgroundStyle === bg ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
              }`}
            >
              {bg === 'gradient' ? '渐变' : bg === 'solid' ? '纯色' : '图案'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
