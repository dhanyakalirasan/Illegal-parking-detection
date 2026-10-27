import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle theme-toggle-fixed">
      <button 
        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Light Mode"
      >
        <Sun size={18} />
      </button>
      <button 
        className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        title="Device Theme"
      >
        <Monitor size={18} />
      </button>
      <button 
        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark Mode"
      >
        <Moon size={18} />
      </button>
    </div>
  );
};

export default ThemeToggle;
