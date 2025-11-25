import type { PRInput, DiffInput, ReviewResult } from './types';

class ReviewAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  async reviewPR(data: PRInput): Promise<ReviewResult> {
    const response = await fetch(`${this.baseURL}/review-pr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async reviewDiff(data: DiffInput): Promise<ReviewResult> {
    const response = await fetch(`${this.baseURL}/review-diff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    
    if (!response.ok) {
      throw new Error('Backend is not healthy');
    }

    return response.json();
  }
}

export const api = new ReviewAPI();
