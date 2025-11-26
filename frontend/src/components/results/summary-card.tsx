// frontend/src/components/results/summary-card.tsx - FIXED to match backend
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReviewResult } from '@/lib/types';
import { AlertCircle, AlertTriangle, Info, XCircle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface SummaryCardProps {
  result: ReviewResult;
}

export function SummaryCard({ result }: SummaryCardProps) {
  const { summary } = result;

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

  const getHealthScore = () => {
    const total = summary.total_comments;
    if (total === 0) return 100;
    
    const criticalWeight = summary.critical * 10;
    const majorWeight = summary.major * 5;
    const minorWeight = summary.minor * 2;
    const infoWeight = summary.info * 1;
    
    const totalWeight = criticalWeight + majorWeight + minorWeight + infoWeight;
    const maxWeight = 100;
    
    return Math.max(0, Math.round(100 - (totalWeight / maxWeight) * 100));
  };

  const healthScore = getHealthScore();
  const isHealthy = healthScore >= 80;
  const needsWork = healthScore < 60;

  return (
    <Card className="mb-6 shadow-xl border-2 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            📊 Review Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            {isHealthy ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : needsWork ? (
              <TrendingDown className="h-6 w-6 text-red-500" />
            ) : (
              <TrendingUp className="h-6 w-6 text-yellow-500" />
            )}
            <div className="text-right">
              <div className="text-3xl font-bold">{healthScore}%</div>
              <div className="text-xs text-gray-500">Health Score</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {summary.total_comments}
            </span>
            <div>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {summary.total_comments === 1 ? 'Issue Found' : 'Issues Found'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {summary.message}
              </div>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group p-4 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary.critical}
                </span>
              </div>
              <Badge variant="critical" className="w-full justify-center">
                Critical
              </Badge>
            </div>

            <div className="group p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {summary.major}
                </span>
              </div>
              <Badge variant="major" className="w-full justify-center">
                Major
              </Badge>
            </div>

            <div className="group p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {summary.minor}
                </span>
              </div>
              <Badge variant="minor" className="w-full justify-center">
                Minor
              </Badge>
            </div>

            <div className="group p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <Info className="h-6 w-6 text-blue-500" />
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.info}
                </span>
              </div>
              <Badge variant="info" className="w-full justify-center">
                Info
              </Badge>
            </div>
          </div>

          {/* Agent Stats */}
          {Object.keys(result.files).length > 0 && (
            <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                📂 Files Analyzed:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.files).map(([file, severities]) => {
                  const issueCount = Object.values(severities).reduce(
                    (sum, comments) => sum + comments.length,
                    0
                  );
                  return (
                    <Badge key={file} variant="outline" className="text-xs px-3 py-1">
                      {file.split('/').pop()}: {issueCount}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Health Message */}
          {summary.total_comments === 0 ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Excellent! No issues detected
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your code looks great. All 5 agents gave it a thumbs up! 👍
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border-2 ${
              needsWork 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-3">
                {needsWork ? (
                  <TrendingDown className="h-6 w-6 text-red-500 flex-shrink-0" />
                ) : (
                  <TrendingUp className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-semibold ${
                    needsWork 
                      ? 'text-red-900 dark:text-red-100' 
                      : 'text-yellow-900 dark:text-yellow-100'
                  }`}>
                    {needsWork ? 'Needs Attention' : 'Good Progress'}
                  </p>
                  <p className={`text-sm ${
                    needsWork 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {needsWork 
                      ? 'Address critical and major issues before merging' 
                      : 'Review the suggestions below to improve code quality'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}