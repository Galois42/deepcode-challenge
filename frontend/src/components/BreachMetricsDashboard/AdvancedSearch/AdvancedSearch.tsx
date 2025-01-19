import React, { useState, useCallback } from "react";
import _ from "lodash";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchFilters from "./SearchFilters/SearchFilters";
import SearchResults from "./SearchResults/SearchResults";
import type { SearchFilter, SearchResult, SearchParams, FilterType } from "@/types/types";

// Mock data for development and fallback
const mockResults: SearchResult[] = [
  {
    id: 1,
    uri: "https://example.com/login",
    username: "admin",
    password: "redacted",
    domain: "example.com",
    ip_address: "192.168.1.1",
    port: 443,
    path: "/login",
    tags: JSON.stringify({
      type: "ecommerce",
      priority: "high",
      environment: "production"
    }),
    title: "Admin Login",
    is_resolved: false,
    is_accessible: true,
    has_login_form: true,
    login_form_type: "basic",
    web_application: "WordPress",
    is_parked: false,
    is_breached: true,
    created_at: "2024-01-18T10:00:00Z",
  },
  // Add more mock results as needed
];

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [excludedIpRanges, setExcludedIpRanges] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  const fetchData = useCallback(
    async (query: string, filters: SearchFilter[], ipRanges: string[]) => {
      setIsLoading(true);
      setError(null);
      setIsMockData(false);

      try {
        const params: SearchParams = {
          q: query,
          excludedIpRanges: ipRanges,
        };

        // Transform filters into params
        filters.forEach((filter) => {
          if (filter.type === 'tag') {
            const [tagType, tagValue] = filter.value.split(':');
            params[`tag_${tagType}`] = tagValue;
          } else {
            params[filter.type] = filter.value;
          }
        });

        // Attempt to fetch from API
        const response = await axios.get("/api/search", { params });
        setResults(response.data.results);
      } catch (error) {
        console.error("Search error:", error);
        setError("Failed to fetch search results. Falling back to mock data.");

        // Filter mock data based on search params
        const filteredResults = mockResults.filter((result) => {
          // Basic search query filter
          if (
            query &&
            !Object.values(result).some((value) =>
              String(value).toLowerCase().includes(query.toLowerCase())
            )
          ) {
            return false;
          }

          // IP range exclusion filter
          if (
            result.ip_address &&
            ipRanges.some((range) => result.ip_address?.startsWith(range))
          ) {
            return false;
          }

          // Filter based on active filters
          return filters.every((filter) => {
            switch (filter.type) {
              case "application":
                return (
                  result.web_application?.toLowerCase() ===
                  filter.value.toLowerCase()
                );
              case "login_type":
                return result.login_form_type === filter.value;
              case "status":
                switch (filter.value) {
                  case "unresolved":
                    return !result.is_resolved;
                  case "accessible":
                    return result.is_accessible;
                  case "login_form":
                    return result.has_login_form;
                  case "parked":
                    return result.is_parked;
                  case "breached":
                    return result.is_breached;
                  default:
                    return true;
                }
              case "tag":
                try {
                  const [tagType, tagValue] = filter.value.split(':');
                  const tagsObj = JSON.parse(result.tags);
                  return tagsObj[tagType] === tagValue;
                } catch (e) {
                  console.error('Error parsing tags for filtering:', e);
                  return false;
                }
              default:
                return true;
            }
          });
        });

        setResults(filteredResults);
        setIsMockData(true);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search function
  const debouncedFetchData = useCallback(
    _.debounce((query: string, filters: SearchFilter[], ipRanges: string[]) => {
      fetchData(query, filters, ipRanges);
    }, 300),
    [fetchData]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    debouncedFetchData(newQuery, activeFilters, excludedIpRanges);
  };

  const addFilter = (type: FilterType, value: string) => {
    const newFilter = {
      id: _.uniqueId("filter_"),
      type,
      value,
    };
    const updatedFilters = [...activeFilters, newFilter];
    setActiveFilters(updatedFilters);
    debouncedFetchData(searchQuery, updatedFilters, excludedIpRanges);
  };

  const removeFilter = (filterId: string) => {
    const updatedFilters = activeFilters.filter((f) => f.id !== filterId);
    setActiveFilters(updatedFilters);
    debouncedFetchData(searchQuery, updatedFilters, excludedIpRanges);
  };

  const handleIpRangeExclusion = (ranges: string[]) => {
    setExcludedIpRanges(ranges);
    debouncedFetchData(searchQuery, activeFilters, ranges);
  };

  return (
    <Card className="w-full bg-gray-800 border-blue-500/30">
      <CardHeader className="px-6">
        <CardTitle className="text-xl font-semibold text-blue-400">
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeFilters={activeFilters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onIpRangeChange={handleIpRangeExclusion}
        />
        <SearchResults
          results={results}
          isLoading={isLoading}
          error={error}
          isMockData={isMockData}
          onAddFilter={addFilter}
        />
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;