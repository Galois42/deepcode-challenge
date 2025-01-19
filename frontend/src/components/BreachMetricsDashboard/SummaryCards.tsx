import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SecurityMetrics } from '@/types/dashboard';

interface SummaryCardsProps {
  metrics: SecurityMetrics;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            {metrics.total}
          </CardTitle>
          <CardDescription>Total Breaches</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-red-600">
            {metrics.unresolved}
          </CardTitle>
          <CardDescription>Unresolved Breaches</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-green-600">
            {metrics.resolved}
          </CardTitle>
          <CardDescription>Resolved Issues</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-yellow-600">
            {metrics.previouslyBreached}
          </CardTitle>
          <CardDescription>Previously Breached</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SummaryCards;