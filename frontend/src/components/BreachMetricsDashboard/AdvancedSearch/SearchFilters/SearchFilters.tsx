import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import IPRangeExclusion from "./IPRangeExclusion";
import type { FilterType, SearchFilter } from "@/types/types";

// Filter options
export const filterOptions = {
  status: [
    { value: "unresolved", label: "Unresolved" },
    { value: "accessible", label: "Accessible" },
    { value: "login_form", label: "Has Login Form" },
    { value: "parked", label: "Parked Domain" },
    { value: "breached", label: "Previously Breached" },
  ],
  loginType: [
    { value: "basic", label: "Basic Auth" },
    { value: "captcha", label: "CAPTCHA" },
    { value: "otp", label: "OTP/2FA" },
    { value: "other", label: "Other" },
  ],
  application: [
    { value: "wordpress", label: "WordPress" },
    { value: "citrix", label: "Citrix" },
    { value: "exchange", label: "Exchange" },
    { value: "sharepoint", label: "SharePoint" },
    { value: "cisco", label: "Cisco" },
    { value: "custom", label: "Custom Application" },
  ],
};

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeFilters: SearchFilter[];
  onAddFilter: (type: FilterType, value: string) => void;
  onRemoveFilter: (filterId: string) => void;
  onIpRangeChange: (ranges: string[]) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onIpRangeChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Search Bar and Filter Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search domains, IPs, or URIs..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-9 bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gray-800">
            <SheetHeader>
              <SheetTitle className="text-blue-400">Search Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Filter Sections */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-blue-400">
                    Application Type
                  </h3>
                  <Select
                    onValueChange={(value) => onAddFilter("application", value)}
                  >
                    <SelectTrigger className="bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 w-full">
                      <SelectValue
                        className="text-gray-300"
                        placeholder="Select application"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      {filterOptions.application.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="hover:bg-blue-500/10 text-gray-300"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-blue-400">
                    Login Type
                  </h3>
                  <Select
                    onValueChange={(value) => onAddFilter("login_type", value)}
                  >
                    <SelectTrigger className="bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 w-full">
                      <SelectValue
                        className="text-gray-300"
                        placeholder="Select login type"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      {filterOptions.loginType.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="hover:bg-blue-500/10 text-gray-300"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-blue-400">
                    Status
                  </h3>
                  <Select
                    onValueChange={(value) => onAddFilter("status", value)}
                  >
                    <SelectTrigger className="bg-gray-700 text-gray-300 border-gray-600 focus:ring-blue-500 w-full">
                      <SelectValue
                        className="text-gray-300"
                        placeholder="Select status"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      {filterOptions.status.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="hover:bg-blue-500/10 text-gray-300"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* IP Range Exclusion */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-blue-400">
                  IP Range Exclusions
                </h3>
                <IPRangeExclusion onRangesChange={onIpRangeChange} />
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
              className="flex items-center gap-1 text-blue-400 bg-blue-500/10 border-blue-400"
            >
              {filter.type}: {filter.value}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                onClick={() => onRemoveFilter(filter.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
