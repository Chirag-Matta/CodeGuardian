export interface ReviewComment {
  file: string;
  line: number;
  severity: 'critical' | 'major' | 'minor' | 'info';
  agent: string;
  comment: string;
  suggestion?: string;
}

export interface ReviewResult {
  comments: ReviewComment[];
  summary: {
    total: number;
    by_severity: Record<string, number>;
    by_agent: Record<string, number>;
  };
}

export interface PRInput {
  owner: string;
  repo: string;
  pr_number: number;
}

export interface DiffInput {
  diff: string;
}
