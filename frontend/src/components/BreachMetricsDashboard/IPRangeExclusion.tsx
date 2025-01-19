import React, { useState, useCallback } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IPRangeExclusionProps {
  onRangesChange: (ranges: string[]) => void;
}

// Common non-routable IP ranges
const DEFAULT_EXCLUDED_RANGES = [
  '127.0.0.0/8',    // Localhost
  '10.0.0.0/8',     // Private network
  '172.16.0.0/12',  // Private network
  '192.168.0.0/16', // Private network
];

// Simple IP validation regex
const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

const IPRangeExclusion: React.FC<IPRangeExclusionProps> = ({ onRangesChange }) => {
  const [excludedRanges, setExcludedRanges] = useState<string[]>(DEFAULT_EXCLUDED_RANGES);
  const [newRange, setNewRange] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Validate IP range format
  const isValidIPRange = (range: string): boolean => {
    if (!IP_PATTERN.test(range)) return false;
    
    // Split IP and CIDR notation
    const [ip, cidr] = range.split('/');
    const octets = ip.split('.').map(Number);
    
    // Validate each octet
    const validOctets = octets.every(octet => octet >= 0 && octet <= 255);
    
    // Validate CIDR if present
    const validCIDR = !cidr || (parseInt(cidr) >= 0 && parseInt(cidr) <= 32);
    
    return validOctets && validCIDR;
  };

  const addRange = useCallback(() => {
    if (!newRange) {
      setError('Please enter an IP range');
      return;
    }

    if (!isValidIPRange(newRange)) {
      setError('Invalid IP range format. Use format: xxx.xxx.xxx.xxx/xx');
      return;
    }

    if (excludedRanges.includes(newRange)) {
      setError('This IP range is already excluded');
      return;
    }

    setError(null);
    const updatedRanges = [...excludedRanges, newRange];
    setExcludedRanges(updatedRanges);
    setNewRange('');
    onRangesChange(updatedRanges);
  }, [newRange, excludedRanges, onRangesChange]);

  const removeRange = useCallback((range: string) => {
    const updatedRanges = excludedRanges.filter(r => r !== range);
    setExcludedRanges(updatedRanges);
    onRangesChange(updatedRanges);
  }, [excludedRanges, onRangesChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRange();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Excluded IP Ranges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={newRange}
                onChange={(e) => {
                  setNewRange(e.target.value);
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Add IP range (e.g., 192.168.0.0/16)"
                className={error ? 'border-red-500' : ''}
              />
            </div>
            <Button
              onClick={addRange}
              variant="secondary"
              size="icon"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            {excludedRanges.map((range) => (
              <Badge
                key={range}
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                {range}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => removeRange(range)}
                />
              </Badge>
            ))}
          </div>

          {excludedRanges.length === 0 && (
            <div className="text-sm text-gray-500 italic">
              No IP ranges excluded
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IPRangeExclusion;