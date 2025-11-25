'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReviewResult } from '@/lib/types';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface SummaryCardProps {
  result: ReviewResult;
}

export function SummaryCard({ result }: SummaryCardProps) {
  const { comments, summary } = result;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      case 'major':
        return <AlertCircle className="h-5 w-5" />;
      case 'minor':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const severityCounts = summary.by_severity || {};

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">📊 Review Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{summary.total}</span>
            <span className="text-gray-600 dark:text-gray-400">
              {summary.total === 1 ? 'Issue Found' : 'Issues Found'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <Badge variant="critical">
                {severityCounts['critical'] || 0} Critical
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <Badge variant="major">
                {severityCounts['major'] || 0} Major
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <Badge variant="minor">
                {severityCounts['minor'] || 0} Minor
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <Badge variant="info">
                {severityCounts['info'] || 0} Info
              </Badge>
            </div>
          </div>

          {summary.by_agent && Object.keys(summary.by_agent).length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium mb-2">Issues by Agent:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.by_agent).map(([agent, count]) => (
                  <Badge key={agent} variant="outline">
                    {agent}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
