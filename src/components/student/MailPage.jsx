import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Filter, Archive, Trash2 } from 'lucide-react';

const MailPage = () => {
  const { getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'assignments', 'notifications', 'promotions', 'spam'];
  const emails = [
    { id: 1, from: 'Prof. Smith', subject: 'Assignment 2 Feedback', time: '2h ago', category: 'assignments', unread: true },
    { id: 2, from: 'UCL Registry', subject: 'Semester Results Available', time: '1d ago', category: 'notifications', unread: false },
    { id: 3, from: 'Career Services', subject: 'Tech Career Fair 2024', time: '3d ago', category: 'promotions', unread: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-light ${themeConfig.text}`}>Mail</h2>
        <button className={`p-2 ${themeConfig.card} rounded-lg border border-white/20`}>
          <Filter className={`w-5 h-5 ${themeConfig.text}`} />
        </button>
      </div>

      <div className={`${themeConfig.card} rounded-xl p-4 border border-white/20`}>
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeConfig.textMuted}`} />
          <input 
            className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg ${themeConfig.text} placeholder-white/40`}
            placeholder="Search emails..."
          />
        </div>

        <div className="flex space-x-2 mb-4 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? themeConfig.button
                  : `${themeConfig.textSecondary} ${themeConfig.cardHover}`
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {emails
            .filter(e => selectedCategory === 'all' || e.category === selectedCategory)
            .map(email => (
            <div key={email.id} className={`p-4 rounded-lg border border-white/10 ${themeConfig.cardHover} cursor-pointer`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={`font-medium ${email.unread ? themeConfig.text : themeConfig.textSecondary}`}>
                      {email.from}
                    </span>
                    {email.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                  <h3 className={`${themeConfig.text} mb-1`}>{email.subject}</h3>
                  <span className={`text-sm ${themeConfig.textMuted}`}>{email.time}</span>
                </div>
                <div className="flex space-x-2">
                  <button className={`p-1 ${themeConfig.textMuted} hover:${themeConfig.text}`}>
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className={`p-1 ${themeConfig.textMuted} hover:text-red-400`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MailPage;
