// frontend/src/app/page.tsx - Enhanced with animations and gradients
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Bug, Code, CheckCircle, GitBranch, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 opacity-50" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Powered by Gemini 2.0 Flash
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
                AI-Powered Code Review
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Get instant security, performance, and quality analysis for your Pull Requests.
              <span className="block mt-2 text-lg text-gray-500 dark:text-gray-400">
                ⚡ Actionable feedback in seconds with 5 specialized AI agents
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/review">
                <Button size="lg" className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <GitBranch className="mr-2 h-5 w-5" />
                  Review GitHub PR
                </Button>
              </Link>
              <Link href="/review?tab=diff">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Try with Diff
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 justify-center">
              {[
                { icon: Zap, text: 'Free Forever' },
                { icon: Shield, text: '100% Secure' },
                { icon: CheckCircle, text: 'No Sign-up Required' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <item.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="relative bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              5 Specialized AI Agents
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Each agent is trained to detect specific issues in your code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: Shield,
                title: 'Security',
                color: 'red',
                description: 'SQL injection, XSS, hardcoded secrets',
                gradient: 'from-red-500 to-pink-500',
              },
              {
                icon: Zap,
                title: 'Performance',
                color: 'orange',
                description: 'N+1 queries, inefficient algorithms',
                gradient: 'from-orange-500 to-yellow-500',
              },
              {
                icon: Bug,
                title: 'Logic',
                color: 'yellow',
                description: 'Off-by-one errors, null pointers',
                gradient: 'from-yellow-500 to-amber-500',
              },
              {
                icon: Code,
                title: 'Code Quality',
                color: 'blue',
                description: 'Debug statements, long lines',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: CheckCircle,
                title: 'Readability',
                color: 'green',
                description: 'Naming, complexity, documentation',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-full w-full text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Three simple steps to better code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: '01',
              title: 'Paste PR URL',
              description: 'Simply paste your GitHub Pull Request URL',
            },
            {
              step: '02',
              title: 'AI Analysis',
              description: '5 specialized agents analyze your code in parallel',
            },
            {
              step: '03',
              title: 'Get Insights',
              description: 'Receive actionable feedback with fix suggestions',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-2xl font-bold text-white shadow-lg">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
              {idx < 2 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Improve Your Code?
            </h2>
            <p className="text-xl text-indigo-100">
              Join developers using AI-powered code review. No credit card required.
            </p>
            <Link href="/review">
              <Button size="lg" variant="secondary" className="text-lg h-14 px-8 bg-white text-indigo-600 hover:bg-gray-100">
                Start Reviewing Now →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}