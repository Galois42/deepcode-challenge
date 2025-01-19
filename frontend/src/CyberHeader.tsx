import React, { useEffect, useState } from 'react';
import { Search, BarChart3, Shield } from 'lucide-react';

interface CyberHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CyberHeader: React.FC<CyberHeaderProps> = ({ activeTab, onTabChange }) => {
  const [scanPosition, setScanPosition] = useState(0);

  // Scanning line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanPosition((prev) => (prev === 100 ? 0 : prev + 1));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative bg-gray-900 border-b border-blue-500">
      {/* Animated scan line */}
      <div 
        className="absolute h-px w-full bg-blue-400 opacity-50"
        style={{
          top: `${scanPosition}%`,
          boxShadow: '0 0 10px #60A5FA, 0 0 20px #60A5FA',
        }}
      />
      
      {/* Header content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-400 animate-pulse" />
            <div className="relative">
                <h1 className="text-2xl font-bold text-pink-500 [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]">
                Breach Monitor
                <span className="absolute -inset-1 bg-blue-400 opacity-20 blur" />
                </h1>
              <div className="text-xs text-blue-300 animate-pulse">
                SYSTEM ACTIVE
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1">
            <button
              onClick={() => onTabChange("dashboard")}
              className={`
                flex items-center px-4 py-2 rounded-lg transition-all duration-300
                ${activeTab === "dashboard"
                  ? "bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-400"
                  : "text-gray-400 hover:bg-blue-500 hover:bg-opacity-10 hover:text-blue-300"}
              `}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="font-medium">Dashboard</span>
              {activeTab === "dashboard" && (
                <span className="absolute -inset-1 bg-blue-400 opacity-20 blur" />
              )}
            </button>
            <button
              onClick={() => onTabChange("search")}
              className={`
                flex items-center px-4 py-2 rounded-lg transition-all duration-300
                ${activeTab === "search"
                  ? "bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-400"
                  : "text-gray-400 hover:bg-blue-500 hover:bg-opacity-10 hover:text-blue-300"}
              `}
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="font-medium">Search</span>
              {activeTab === "search" && (
                <span className="absolute -inset-1 bg-blue-400 opacity-20 blur" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
    </header>
  );
};

export default CyberHeader;