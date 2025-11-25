'use client';

import { SummaryCard } from './summary-card';
import { IssueCard } from './issue-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ReviewResult, ReviewComment } from '@/lib/types';
import { useState, useMemo } from 'react';
import { FileCode, Search } from 'lucide-react';

interface ResultsDisplayProps {
  result: ReviewResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<string>('all');

  // Group issues by file
  const issuesByFile = useMemo(() => {
    const grouped: Record<string, ReviewComment[]> = {};
    result.comments.forEach((comment) => {
      if (!grouped[comment.file]) {
        grouped[comment.file] = [];
      }
      grouped[comment.file].push(comment);
    });
    return grouped;
  }, [result.comments]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    let filtered = result.comments;

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
          issue.file.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [result.comments, selectedSeverity, selectedFile, searchQuery]);

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
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Severity Filter */}
            <select
              className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="info">Info</option>
            </select>

            {/* File Filter */}
            <select
              className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredIssues.length} of {result.comments.length} issues
          </div>
        </CardContent>
      </Card>

      {/* Issues by File */}
      {Object.entries(filteredByFile).map(([file, issues]) => (
        <div key={file}>
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold">{file}</h3>
            <Badge variant="outline">{issues.length} issues</Badge>
          </div>

          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <IssueCard key={`${file}-${idx}`} issue={issue} />
            ))}
          </div>
        </div>
      ))}

      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No issues found matching your filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
