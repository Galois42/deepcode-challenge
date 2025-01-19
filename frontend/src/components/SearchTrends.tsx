import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import type { SearchTrendsProps } from '@/types/dashboard';

const SearchTrends: React.FC<SearchTrendsProps> = ({ data }) => {
  // Helper function to get cell background color based on value
  const getCellColor = (value: number): string => {
    // Create a vibrant gradient from light yellow to bright red
    const intensity = Math.min(value / 50, 1);
    
    // Start with a light yellow (255, 255, 220)
    // Transition to vibrant red (255, 0, 0)
    const red = 255; // Keep red at maximum for vibrancy
    const green = Math.round(255 - (intensity * 255)); // Reduce green to zero
    const blue = Math.round(220 - (intensity * 220)); // Reduce blue to zero
    
    return `rgb(${red}, ${green}, ${blue})`;
};

  // Generate hours for the day
  const hours: string[] = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0') + ':00'
  );

  // Generate days of the week
  const days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-amber-600" />
          Search Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Hours header */}
            <div className="flex">
              <div className="w-16" /> {/* Spacer for day labels */}
              {hours.map(hour => (
                <div 
                  key={hour}
                  className="w-8 text-xs text-amber-800 rotate-90 origin-top-left translate-x-8"
                >
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="mt-8">
              {days.map((day) => (
                <div key={day} className="flex items-center">
                  <div className="w-16 text-sm text-amber-800 font-medium">{day}</div>
                  {hours.map((_, hourIndex) => {
                    const value = data[day]?.[hourIndex] || 0;
                    return (
                      <div
                        key={hourIndex}
                        className="w-8 h-8 border border-amber-100 transition-all duration-200 hover:border-amber-300 hover:scale-105"
                        style={{ 
                          backgroundColor: getCellColor(value),
                          boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)'
                        }}
                        title={`${day} ${hours[hourIndex]}: ${value} searches`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchTrends;