// frontend/src/components/review/diff-input.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, FileText, Shield, Zap, Bug, Code, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import type { ReviewResult } from '@/lib/types';

interface DiffInputProps {
  onReviewComplete: (data: ReviewResult) => void;
}

const AGENTS = [
  { 
    id: 'security_agent', 
    name: 'Security', 
    icon: Shield, 
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'SQL injection, XSS, secrets'
  },
  { 
    id: 'performance_agent', 
    name: 'Performance', 
    icon: Zap, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    description: 'N+1 queries, inefficient loops'
  },
  { 
    id: 'logic_agent', 
    name: 'Logic', 
    icon: Bug, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    description: 'Null pointers, off-by-one errors'
  },
  { 
    id: 'code_quality_agent', 
    name: 'Code Quality', 
    icon: Code, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Debug statements, long lines'
  },
  { 
    id: 'readability_agent', 
    name: 'Readability', 
    icon: BookOpen, 
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    description: 'Naming, complexity'
  },
];

export function DiffInput({ onReviewComplete }: DiffInputProps) {
  const [diff, setDiff] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Agent selection - all selected by default
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    AGENTS.map(a => a.id)
  );

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const selectAllAgents = () => {
    setSelectedAgents(AGENTS.map(a => a.id));
  };

  const deselectAllAgents = () => {
    setSelectedAgents([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!diff.trim()) {
      setError('Please paste a valid git diff');
      return;
    }

    if (selectedAgents.length === 0) {
      setError('Please select at least one agent to run');
      return;
    }

    setLoading(true);

    try {
      const result = await api.reviewDiff({
        diff: diff.trim(),
        agents: selectedAgents,
      });
      onReviewComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review diff. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const pasteExample = () => {
    const exampleDiff = `diff --git a/src/auth.py b/src/auth.py
index 123abc..456def 100644
--- a/src/auth.py
+++ b/src/auth.py
@@ -10,7 +10,8 @@ def login(username, password):
     """Authenticate user"""
-    query = "SELECT * FROM users WHERE username='" + username + "'"
+    # Fixed SQL injection vulnerability
+    query = "SELECT * FROM users WHERE username=?"
     cursor.execute(query, (username,))
     user = cursor.fetchone()
     
@@ -20,6 +21,7 @@ def login(username, password):
         return None
     
+    # TODO: Add rate limiting
     if check_password(user['password'], password):
         return generate_token(user)
     return None`;
    
    setDiff(exampleDiff);
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-xl border-2">
      <CardHeader className="space-y-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-600 dark:bg-teal-500">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Review Git Diff</CardTitle>
            <CardDescription className="text-base">
              Paste your git diff output for instant AI-powered analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">
                Select Review Agents ({selectedAgents.length}/{AGENTS.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllAgents}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Select All
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  type="button"
                  onClick={deselectAllAgents}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AGENTS.map((agent) => {
                const isSelected = selectedAgents.includes(agent.id);
                const Icon = agent.icon;
                
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `${agent.borderColor} ${agent.bgColor} shadow-md`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${isSelected ? agent.color : 'text-gray-400'}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold text-sm ${
                            isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'
                          }`}>
                            {agent.name}
                          </p>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                Diff Content
              </span>
            </div>
          </div>

          {/* Diff Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold flex items-center gap-2">
                Git Diff Output
                {diff.trim() && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </label>
              <button
                type="button"
                onClick={pasteExample}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              placeholder="Paste your git diff here...

Example:
diff --git a/file.py b/file.py
index 123abc..456def 100644
--- a/file.py
+++ b/file.py
@@ -1,3 +1,4 @@
+import logging
 def hello():
-    print('Hello')
+    logging.info('Hello')"
              className="w-full h-80 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 resize-y transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Run <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">git diff</code> in your terminal and paste the output here
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700" 
            disabled={loading || !diff.trim() || selectedAgents.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing with {selectedAgents.length} Agent{selectedAgents.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Review with {selectedAgents.length} Agent{selectedAgents.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {loading && (
            <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Running {selectedAgents.length} AI agent{selectedAgents.length !== 1 ? 's' : ''}...
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This typically takes 10-30 seconds depending on diff size
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}