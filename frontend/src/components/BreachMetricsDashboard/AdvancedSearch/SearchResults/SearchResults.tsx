import React from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import URLStatusIndicators from "./URLStatusIndicators";
import type { SearchResult, FilterType } from "@/types/types";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  isMockData: boolean;
  onAddFilter: (type: FilterType, value: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  error,
  isMockData,
  onAddFilter,
}) => {
  // Helper function to validate and process URL status data
  const processURLStatusData = (result: SearchResult) => {
    return {
      isAccessible: Boolean(result.is_accessible),
      hasLoginForm: Boolean(result.has_login_form),
      // Only pass loginType if hasLoginForm is true and login_form_type has a valid value
      loginType: result.has_login_form && result.login_form_type ? result.login_form_type : undefined,
      // Only pass applicationName if it exists and isn't empty
      applicationName: result.web_application && result.web_application.trim() !== '' 
        ? result.web_application 
        : undefined,
      // Only pass title if it exists and isn't empty
      title: result.title && result.title.trim() !== '' 
        ? result.title 
        : undefined,
      isParked: Boolean(result.is_parked),
      wasBreached: Boolean(result.is_breached)
    };
  };

  // Helper function to safely parse tags
  const renderTags = (tags: string) => {
    try {
      const tagsObj = JSON.parse(tags);
      return Object.entries(tagsObj).map(([key, value], idx) => (
        <Badge
          key={idx}
          variant="outline"
          className="cursor-pointer hover:bg-blue-500/10 text-blue-400 border-blue-400"
          onClick={() => onAddFilter("tag", `${key}:${value}`)}
        >
          {`${key}: ${value}`}
        </Badge>
      ));
    } catch (e) {
      console.error("Error parsing tags:", e);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {isMockData && (
        <div className="text-yellow-400 mb-4">
          Showing mock data for demonstration purposes
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-blue-500/30 max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-400">
                Domain/URI
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-400">
                Tags
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-400">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500/20 bg-gray-800">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-blue-500/10">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-300">
                    {result.domain}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-md">
                    {result.uri}
                  </div>
                  {result.ip_address && (
                    <div className="text-xs text-gray-500">
                      IP: {result.ip_address}
                      {result.port ? ` (Port: ${result.port})` : ''}
                    </div>
                  )}
                  <URLStatusIndicators {...processURLStatusData(result)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {renderTags(result.tags)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(result.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && (
          <div className="text-center py-8 text-gray-500">No results found</div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;