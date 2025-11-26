// frontend/src/lib/types.ts - FIXED to match backend response
export interface ReviewComment {
  file: string;
  line: number;
  severity: 'critical' | 'major' | 'minor' | 'info';
  agent: string;
  comment: string;
  suggestion?: string;
}

export interface ReviewSummary {
  total_comments: number;
  critical: number;
  major: number;
  minor: number;
  info: number;
  message: string;
}

export interface ReadableAgentComment {
  agent: string;
  comment: string;
  suggestion?: string;
  lines: number[];
}

// Backend response structure
export interface ReviewResult {
  summary: ReviewSummary;
  files: Record<string, Record<string, ReadableAgentComment[]>>;
  total: number;
}

export interface PRInput {
  owner: string;
  repo: string;
  pr_number: number;
  agents?: string[]; // Optional: selected agent names
}

export interface DiffInput {
  diff: string;
  agents?: string[]; // Optional: selected agent names
}

// Helper to convert backend response to flat comments for easier filtering
export function flattenReviewResult(result: ReviewResult): ReviewComment[] {
  const comments: ReviewComment[] = [];
  
  Object.entries(result.files).forEach(([file, severityMap]) => {
    Object.entries(severityMap).forEach(([severity, agentComments]) => {
      agentComments.forEach((ac) => {
        ac.lines.forEach((line) => {
          comments.push({
            file,
            line,
            severity: severity as ReviewComment['severity'],
            agent: ac.agent,
            comment: ac.comment,
            suggestion: ac.suggestion,
          });
        });
      });
    });
  });
  
  return comments;
}