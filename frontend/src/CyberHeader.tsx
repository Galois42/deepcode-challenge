import React, { useEffect, useState } from 'react';
import { Search, Shield } from 'lucide-react';

interface CyberHeaderProps {
  isSearchVisible: boolean;
  onSearchToggle: () => void;
}

const CyberHeader: React.FC<CyberHeaderProps> = ({ 
  isSearchVisible, 
  onSearchToggle 
}) => {
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
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Search Button */}
          <button
            onClick={onSearchToggle}
            className={`
              flex items-center px-4 py-2 rounded-lg
              transition-all duration-300 
              relative group
              ${isSearchVisible
                ? "bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-400"
                : "text-gray-400 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-400/50 border border-transparent"}
            `}
          >
            <Search className={`
              w-4 h-4 mr-2 
              transition-transform duration-300
              group-hover:scale-110
              ${isSearchVisible ? 'rotate-90' : 'group-hover:rotate-12'}
            `} />
            <span className="font-medium">Search</span>
            
            {/* Glow effect */}
            <div className={`
              absolute inset-0 rounded-lg
              transition-opacity duration-300
              ${isSearchVisible 
                ? 'opacity-100 animate-pulse'
                : 'opacity-0 group-hover:opacity-100'}
              bg-blue-400/10 blur-sm -z-10
            `} />

            {/* Ripple effect container */}
            <span className="absolute inset-0 overflow-hidden rounded-lg -z-10">
              <span className={`
                absolute inset-0 rounded-lg
                group-hover:bg-blue-400/10
                transition-[transform,opacity] duration-500
                group-hover:scale-[2.5] group-hover:opacity-0
                origin-center
              `} />
            </span>
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
    </header>
  );
};

export default CyberHeader;