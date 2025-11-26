// frontend/src/components/results/issue-card.tsx - Enhanced visuals
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Lightbulb, Code2, Copy, Check } from 'lucide-react';
import type { ReviewComment } from '@/lib/types';

interface IssueCardProps {
  issue: ReviewComment;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSeverityVariant = (severity: string) => {
    return severity as 'critical' | 'major' | 'minor' | 'info';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'major':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'minor':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={`mb-3 border-l-4 ${getSeverityColor(issue.severity)} hover:shadow-lg transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-0.5 hover:bg-white dark:hover:bg-gray-800"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={getSeverityVariant(issue.severity)} className="font-semibold">
                    {issue.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Line {issue.line}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                  >
                    {issue.agent.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                  {issue.comment}
                </p>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="ml-11 space-y-4 pt-3 border-t-2 border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
              {/* File Context */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Code2 className="h-4 w-4" />
                    <span className="font-medium">File:</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(issue.file)}
                    className="h-7 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy path
                      </>
                    )}
                  </Button>
                </div>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 font-mono break-all">
                  {issue.file}
                </code>
              </div>

              {/* Suggestion */}
              {issue.suggestion && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        💡 Suggested Fix
                      </p>
                      <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${issue.file}:${issue.line}\n${issue.comment}${issue.suggestion ? `\n\nSuggestion: ${issue.suggestion}` : ''}`)}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Issue
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}