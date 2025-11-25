import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Bug, Code } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            AI-Powered Code Review Agent
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            Instant security, performance, and quality analysis for your Pull Requests.
            Get actionable feedback in seconds with Gemini-powered insights.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/review">
              <Button size="lg" className="text-lg">
                Review GitHub PR
              </Button>
            </Link>
            <Link href="/review?tab=diff">
              <Button size="lg" variant="outline" className="text-lg">
                Try with Diff
              </Button>
            </Link>
          </div>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Powered by Gemini
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              100% Secure
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Code Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-red-500 mb-2" />
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  SQL injection, XSS vulnerabilities, hardcoded secrets
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  N+1 queries, inefficient loops, memory leaks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bug className="h-10 w-10 text-yellow-500 mb-2" />
                <CardTitle>Logic</CardTitle>
                <CardDescription>
                  Off-by-one errors, null pointers, type mismatches
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>Code Quality</CardTitle>
                <CardDescription>
                  Debug statements, long lines, magic numbers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Start Reviewing Code Today
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Simply paste your GitHub PR URL and get instant feedback from our AI agents.
          </p>
          <Link href="/review">
            <Button size="lg" className="text-lg">
              Get Started →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
