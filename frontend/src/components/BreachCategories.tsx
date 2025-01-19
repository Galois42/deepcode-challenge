import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreachCategoryProps, CategoryData } from '@/types/dashboard';

const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const BreachCategories: React.FC<BreachCategoryProps> = ({ data }) => {
  const categoryData: CategoryData[] = [
    { name: 'WordPress', value: data.loginFormDistribution.basic },
    { name: 'Citrix', value: data.loginFormDistribution.captcha },
    { name: 'Exchange', value: data.loginFormDistribution.otp },
    { name: 'SharePoint', value: data.loginFormDistribution.other },
    { name: 'Custom', value: data.loginFormTypes?.other || 0 }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Breach Categories Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreachCategories;