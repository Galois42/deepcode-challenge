import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CollapsibleSearchSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSearchSection: React.FC<CollapsibleSearchSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children
}) => {
  return (
    <Card className="w-full bg-gray-800 border-blue-500/30">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center px-4 py-2 text-blue-400 hover:bg-blue-500/10"
        onClick={onToggle}
      >
        <span className="font-medium text-sm">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-blue-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-blue-400" />
        )}
      </Button>
      {isOpen && <CardContent className="bg-gray-700">{children}</CardContent>}
    </Card>
  );
};

export default CollapsibleSearchSection;