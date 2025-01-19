import React, { useState, useCallback } from 'react';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import _ from 'lodash';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import IPRangeExclusion from './IPRangeExclusion';

// Types and options remained the same as before
type LoginFormType = 'basic' | 'captcha' | 'otp' | 'other';
type FilterType = 'domain' | 'ip' | 'port' | 'path' | 'application' | 'login_type' | 'status' | 'tag';

interface SearchFilter {
  id: string;
  type: FilterType;
  value: string;
}

interface SearchResult {
  id: number;
  uri: string;
  username: string;
  password: string;
  domain: string;
  ip_address: string | null;
  port: number | null;
  path: string | null;
  tags: string[];
  title: string | null;
  is_resolved: boolean;
  is_accessible: boolean;
  has_login_form: boolean;
  login_form_type: LoginFormType | null;
  web_application: string | null;
  is_parked: boolean;
  is_breached: boolean;
  created_at: string;
}

const filterOptions = {
  status: [
    { value: 'unresolved', label: 'Unresolved' },
    { value: 'accessible', label: 'Accessible' },
    { value: 'login_form', label: 'Has Login Form' },
    { value: 'parked', label: 'Parked Domain' },
    { value: 'breached', label: 'Previously Breached' }
  ],
  loginType: [
    { value: 'basic', label: 'Basic Auth' },
    { value: 'captcha', label: 'CAPTCHA' },
    { value: 'otp', label: 'OTP/2FA' },
    { value: 'other', label: 'Other' }
  ],
  application: [
    { value: 'wordpress', label: 'WordPress' },
    { value: 'citrix', label: 'Citrix' },
    { value: 'exchange', label: 'Exchange' },
    { value: 'sharepoint', label: 'SharePoint' },
    { value: 'cisco', label: 'Cisco' },
    { value: 'custom', label: 'Custom Application' }
  ]
};

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [excludedIpRanges, setExcludedIpRanges] = useState<string[]>([]);

  // Improved search function with better error handling and type safety
  // Mock data for development
const mockResults: SearchResult[] = [
  {
    id: 1,
    uri: 'https://example.com/login',
    username: 'admin',
    password: 'redacted',
    domain: 'example.com',
    ip_address: '192.168.1.1',
    port: 443,
    path: '/login',
    tags: ['critical', 'unresolved', 'healthcare'],
    title: 'Admin Login',
    is_resolved: false,
    is_accessible: true,
    has_login_form: true,
    login_form_type: 'basic',
    web_application: 'WordPress',
    is_parked: false,
    is_breached: true,
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: 2,
    uri: 'https://test.example.org/admin',
    username: 'user',
    password: 'redacted',
    domain: 'test.example.org',
    ip_address: '10.0.0.1',
    port: 8080,
    path: '/admin',
    tags: ['medium', 'resolved', 'internal'],
    title: 'User Portal',
    is_resolved: true,
    is_accessible: true,
    has_login_form: true,
    login_form_type: 'captcha',
    web_application: 'Custom',
    is_parked: false,
    is_breached: false,
    created_at: '2024-01-17T15:30:00Z'
  }
];

const performSearch = useCallback(
    _.debounce(async (
      query: string,
      filters: SearchFilter[],
      ipRanges: string[]
    ) => {
      setIsLoading(true);
      try {
        // Mock API call - replace with actual API integration
        const response = await new Promise<SearchResult[]>((resolve) => {
          setTimeout(() => {
            // Mock filtering logic
            const filteredResults = mockResults.filter((result: SearchResult) => {
              const matchesQuery = query === '' || 
                result.domain.includes(query) || 
                result.uri.includes(query) ||
                (result.ip_address && result.ip_address.includes(query));

              const matchesFilters = filters.every(filter => {
                switch (filter.type) {
                  case 'status':
                    return filter.value === 'unresolved' ? !result.is_resolved :
                           filter.value === 'accessible' ? result.is_accessible :
                           filter.value === 'login_form' ? result.has_login_form :
                           filter.value === 'parked' ? result.is_parked :
                           filter.value === 'breached' ? result.is_breached : true;
                  case 'application':
                    return result.web_application?.toLowerCase() === filter.value;
                  case 'login_type':
                    return result.login_form_type === filter.value;
                  case 'tag':
                    return result.tags.includes(filter.value);
                  default:
                    return true;
                }
              });

              const notExcluded = !result.ip_address || 
                !ipRanges.some(range => 
                  result.ip_address?.startsWith(range.split('/')[0])
                );

              return matchesQuery && matchesFilters && notExcluded;
            });
            resolve(filteredResults);
          }, 300);
        });
        
        setResults(response);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const addFilter = (type: FilterType, value: string) => {
    const newFilter = {
      id: _.uniqueId('filter_'),
      type,
      value
    };
    const updatedFilters = [...activeFilters, newFilter];
    setActiveFilters(updatedFilters);
    performSearch(searchQuery, updatedFilters, excludedIpRanges);
  };

  const removeFilter = (filterId: string) => {
    const updatedFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedFilters);
    performSearch(searchQuery, updatedFilters, excludedIpRanges);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    performSearch(newQuery, activeFilters, excludedIpRanges);
  };

  const handleIpRangeExclusion = (ranges: string[]) => {
    setExcludedIpRanges(ranges);
    performSearch(searchQuery, activeFilters, ranges);
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-6">
        <CardTitle className="text-xl font-semibold">Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar and Filter Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search domains, IPs, or URIs..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Filter Sections */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Application Type</h3>
                    <Select onValueChange={(value) => addFilter('application', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.application.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Login Type</h3>
                    <Select onValueChange={(value) => addFilter('login_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select login type" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.loginType.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Status</h3>
                    <Select onValueChange={(value) => addFilter('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.status.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* IP Range Exclusion */}
                <div>
                  <h3 className="text-sm font-medium mb-2">IP Range Exclusions</h3>
                  <IPRangeExclusion onRangesChange={handleIpRangeExclusion} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.type}: {filter.value}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeFilter(filter.id)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Results Section */}
        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Domain/URI</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tags</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{result.domain}</div>
                        <div className="text-xs text-gray-500 truncate max-w-md">{result.uri}</div>
                        {result.ip_address && (
                          <div className="text-xs text-gray-500">
                            IP: {result.ip_address} {result.port && `(Port: ${result.port})`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {result.login_form_type && (
                            <Badge variant="outline">{result.login_form_type}</Badge>
                          )}
                          {result.web_application && (
                            <Badge variant="secondary">{result.web_application}</Badge>
                          )}
                          {result.is_breached && (
                            <Badge variant="destructive">Breached</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {result.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => addFilter('tag', tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
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
                <div className="text-center py-8 text-gray-500">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;