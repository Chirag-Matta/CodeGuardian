// frontend/src/components/results/results-display.tsx - FIXED with proper data handling
'use client';

import { SummaryCard } from './summary-card';
import { IssueCard } from './issue-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { ReviewResult, ReviewComment } from '@/lib/types';
import { flattenReviewResult } from '@/lib/types';
import { useState, useMemo } from 'react';
import { FileCode, Search, Filter } from 'lucide-react';

interface ResultsDisplayProps {
  result: ReviewResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<string>('all');

  // Flatten the nested structure to a list of comments
  const allComments = useMemo(() => flattenReviewResult(result), [result]);

  // Group issues by file
  const issuesByFile = useMemo(() => {
    const grouped: Record<string, ReviewComment[]> = {};
    allComments.forEach((comment) => {
      if (!grouped[comment.file]) {
        grouped[comment.file] = [];
      }
      grouped[comment.file].push(comment);
    });
    return grouped;
  }, [allComments]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    let filtered = allComments;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter((issue) => issue.severity === selectedSeverity);
    }

    if (selectedFile !== 'all') {
      filtered = filtered.filter((issue) => issue.file === selectedFile);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (issue) =>
          issue.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.agent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allComments, selectedSeverity, selectedFile, searchQuery]);

  // Group filtered issues by file
  const filteredByFile = useMemo(() => {
    const grouped: Record<string, ReviewComment[]> = {};
    filteredIssues.forEach((comment) => {
      if (!grouped[comment.file]) {
        grouped[comment.file] = [];
      }
      grouped[comment.file].push(comment);
    });
    return grouped;
  }, [filteredIssues]);

  const files = Object.keys(issuesByFile);

  return (
    <div className="space-y-6">
      <SummaryCard result={result} />

      {/* Filters */}
      <Card className="shadow-md border-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-lg">Filter Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search issues, files, agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11"
              />
            </div>

            {/* Severity Filter */}
            <select
              className="h-11 w-full rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="major">🟠 Major</option>
              <option value="minor">🟡 Minor</option>
              <option value="info">🔵 Info</option>
            </select>

            {/* File Filter */}
            <select
              className="h-11 w-full rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              <option value="all">All Files ({files.length})</option>
              {files.map((file) => (
                <option key={file} value={file}>
                  {file} ({issuesByFile[file].length})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredIssues.length}</span> of <span className="font-semibold">{allComments.length}</span> issues
            </span>
            {(searchQuery || selectedSeverity !== 'all' || selectedFile !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSeverity('all');
                  setSelectedFile('all');
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issues by File */}
      {Object.entries(filteredByFile).map(([file, issues]) => (
        <div key={file} className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg border-l-4 border-indigo-500">
            <FileCode className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold flex-1">{file}</h3>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </Badge>
          </div>

          <div className="space-y-2 pl-4">
            {issues.map((issue, idx) => (
              <IssueCard key={`${file}-${idx}`} issue={issue} />
            ))}
          </div>
        </div>
      ))}

      {filteredIssues.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  No issues found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}