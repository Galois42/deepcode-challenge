import { useState } from "react";
import CyberHeader from "./CyberHeader";
import BreachMetricsDashboard from "@/components/BreachMetricsDashboard/BreachMetricsDashboard";
import AdvancedSearch from "@/components/BreachMetricsDashboard/AdvancedSearch/AdvancedSearch";
import DynamicParallaxBackground from "./DynamicBackground";

const BreachMonitor = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background - Make sure it's below everything */}
      <DynamicParallaxBackground />
      
      {/* Foreground Content - This should be above the background */}
      <div className="relative z-10">
        <CyberHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg shadow-lg shadow-blue-500/20 p-6 border border-blue-500/20">
            {activeTab === "dashboard" ? (
              <div className="flex">
                {/* Advanced Search Sidebar */}
                {isSearchVisible && (
                  <div className="w-1/4 bg-gray-800/90 border border-blue-500/30 rounded-lg p-4 transition-transform duration-300 z-20">
                    <h2 className="text-lg font-semibold text-blue-400 mb-4">
                      Advanced Search
                    </h2>
                    <AdvancedSearch />
                  </div>
                )}

                {/* Main Dashboard */}
                <div
                  className={`${
                    isSearchVisible ? "w-3/4" : "w-full"
                  } transition-all duration-300`}
                >
                  <div className="animate-fadeIn">
                    <BreachMetricsDashboard />
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <AdvancedSearch />
              </div>
            )}
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
