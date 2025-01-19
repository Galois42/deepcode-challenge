import { useState } from "react";
import CyberHeader from "./CyberHeader";
import BreachMetricsDashboard from "@/components/BreachMetricsDashboard/BreachMetricsDashboard";
import AdvancedSearch from "@/components/BreachMetricsDashboard/AdvancedSearch/AdvancedSearch";
import DynamicParallaxBackground from "./DynamicBackground";

const BreachMonitor = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Dynamic Background */}
      <DynamicParallaxBackground />

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <CyberHeader 
          isSearchVisible={isSearchVisible} 
          onSearchToggle={() => setIsSearchVisible(!isSearchVisible)} 
        />
      </div>

      {/* Search Panel */}
      <div
        className={`
          fixed top-0 left-0 right-0 z-40 transform transition-transform duration-500 ease-in-out bg-gray-900
          ${isSearchVisible ? 'translate-y-16' : '-translate-y-full'}
        `}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-lg shadow-lg shadow-blue-500/20 border border-blue-500/20">
            <AdvancedSearch />
          </div>
        </div>
      </div>

      {/* Main Content - Add padding-top to account for fixed header */}
      <div className="relative z-10 pt-16">
        {/* Main Dashboard Content */}
        <main className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div 
            className={`
              rounded-lg shadow-lg shadow-blue-500/20 p-6 border border-blue-500/20
              transition-all duration-500 ease-in-out
              ${isSearchVisible ? 'opacity-30 pointer-events-none' : 'opacity-100'}
            `}
          >
            <BreachMetricsDashboard />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-6">
          <div>
            <p className="text-center text-sm text-blue-400">
              Monitoring and protecting your data security
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BreachMonitor;