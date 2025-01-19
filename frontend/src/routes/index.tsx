import { useState } from "react";
import { Search, BarChart3 } from "lucide-react";
import BreachMetricsDashboard from "@/components/BreachMetricsDashboard/BreachMetricsDashboard";
import AdvancedSearch from "@/components/BreachMetricsDashboard/AdvancedSearch/AdvancedSearch";

const BreachMonitor = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Breach Monitor
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === "search"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                <span className="font-medium">Search</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
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
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Monitoring and protecting your data security
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BreachMonitor;
