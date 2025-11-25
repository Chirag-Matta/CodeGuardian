'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import type { ReviewComment } from '@/lib/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface IssueCardProps {
  issue: ReviewComment;
  isDark?: boolean;
}

export function IssueCard({ issue, isDark = false }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityVariant = (severity: string) => {
    return severity as 'critical' | 'major' | 'minor' | 'info';
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mt-0.5"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getSeverityVariant(issue.severity)}>
                    {issue.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Line {issue.line}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {issue.agent}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{issue.comment}</p>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="ml-9 space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              {/* Code Context */}
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  File: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{issue.file}</code>
                </p>
              </div>

              {/* Suggestion */}
              {issue.suggestion && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Suggestion:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
