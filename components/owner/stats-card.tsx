'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  subtext,
  trend,
}: StatsCardProps) {
  return (
    <Card className="p-6 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </div>

      {trend && (
        <div className="pt-2 border-t">
          <span
            className={`text-xs font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}% from last month
          </span>
        </div>
      )}
    </Card>
  );
}
