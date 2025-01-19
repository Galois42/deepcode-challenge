import { useState } from "react";
import CyberHeader from "./CyberHeader";
import BreachMetricsDashboard from "@/components/BreachMetricsDashboard/BreachMetricsDashboard";
import AdvancedSearch from "@/components/BreachMetricsDashboard/AdvancedSearch";
import DynamicBackground from "./DynamicBackground";

const BreachMonitor = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background */}
      <DynamicBackground />

      {/* Foreground Content */}
      <div className="relative z-10">
        <CyberHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg shadow-lg shadow-blue-500/20 p-6 border border-blue-500/20">
            {activeTab === "dashboard" ? (
              <div className="animate-fadeIn">
                <BreachMetricsDashboard />
              </div>
            ) : (
              <div className="animate-fadeIn">
                <AdvancedSearch />
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer>
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
