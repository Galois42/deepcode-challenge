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
    <Card className="w-full">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center px-4 py-2 hover:bg-gray-100"
        onClick={onToggle}
      >
        <span className="font-medium text-sm">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
};

export default CollapsibleSearchSection;