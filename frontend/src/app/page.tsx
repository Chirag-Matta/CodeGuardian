// frontend/src/app/page.tsx - Redesigned with Readable Colors
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Bug, Code, CheckCircle, GitBranch, Sparkles, Eye, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Vibrant Dark Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-teal-950 to-cyan-950 dark:from-gray-950 dark:via-teal-900 dark:to-cyan-900">
        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border-2 border-teal-400/50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-teal-300" />
              <span className="text-sm font-semibold text-teal-100">
                Powered by Gemini 2.0 Flash
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient">
                AI-Powered Code Review
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed font-medium">
              Get instant security, performance, and quality analysis for your Pull Requests
              <span className="block mt-3 text-lg text-teal-200">
                ⚡ Actionable feedback in seconds with 5 specialized AI agents
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/review">
                <Button size="lg" className="text-lg h-14 px-8 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold border-2 border-teal-400/50">
                  <GitBranch className="mr-2 h-5 w-5" />
                  Review GitHub PR
                </Button>
              </Link>
              <Link href="/review?tab=diff">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 border-gray-400 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold">
                  Try with Diff
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 text-sm justify-center">
              {[
                { icon: Zap, text: 'Free Forever', color: 'teal' },
                { icon: Shield, text: '100% Secure', color: 'cyan' },
                { icon: CheckCircle, text: 'No Sign-up Required', color: 'blue' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-md hover:shadow-lg transition-shadow">
                  <item.icon className="h-4 w-4 text-teal-300" />
                  <span className="font-semibold text-white">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-white dark:bg-gray-900 border-y-2 border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-50">
              5 Specialized AI Agents
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto font-medium">
              Each agent is trained to detect specific issues in your code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: Shield,
                title: 'Security',
                description: 'SQL injection, XSS, hardcoded secrets',
                gradient: 'from-red-500 to-rose-500',
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-800',
                iconBg: 'bg-red-500',
              },
              {
                icon: Zap,
                title: 'Performance',
                description: 'N+1 queries, inefficient algorithms',
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                border: 'border-amber-200 dark:border-amber-800',
                iconBg: 'bg-amber-500',
              },
              {
                icon: Bug,
                title: 'Logic',
                description: 'Off-by-one errors, null pointers',
                gradient: 'from-yellow-400 to-amber-400',
                bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                border: 'border-yellow-200 dark:border-yellow-800',
                iconBg: 'bg-yellow-500',
              },
              {
                icon: Code,
                title: 'Code Quality',
                description: 'Debug statements, long lines',
                gradient: 'from-blue-500 to-cyan-500',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                border: 'border-blue-200 dark:border-blue-800',
                iconBg: 'bg-blue-500',
              },
              {
                icon: CheckCircle,
                title: 'Readability',
                description: 'Naming, complexity, documentation',
                gradient: 'from-emerald-500 to-green-500',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                border: 'border-emerald-200 dark:border-emerald-800',
                iconBg: 'bg-emerald-500',
              },
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${feature.border} ${feature.bg}`}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 h-16 w-16 rounded-2xl ${feature.iconBg} p-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-full w-full text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-50">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-50">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Three simple steps to better code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: '01',
              title: 'Paste PR URL',
              description: 'Simply paste your GitHub Pull Request URL',
              icon: Target,
            },
            {
              step: '02',
              title: 'AI Analysis',
              description: '5 specialized agents analyze your code in parallel',
              icon: Eye,
            },
            {
              step: '03',
              title: 'Get Insights',
              description: 'Receive actionable feedback with fix suggestions',
              icon: CheckCircle,
            },
          ].map((item, idx) => (
            <div key={idx} className="relative text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-3xl font-bold text-white shadow-xl">
                {item.step}
              </div>
              <div className="mb-3 flex justify-center">
                <item.icon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-50">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {item.description}
              </p>
              {idx < 2 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-1 bg-gradient-to-r from-teal-300 to-cyan-300 dark:from-teal-700 dark:to-cyan-700" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Improve Your Code?
            </h2>
            <p className="text-xl text-teal-50">
              Join developers using AI-powered code review. No credit card required.
            </p>
            <Link href="/review">
              <Button size="lg" variant="secondary" className="text-lg h-14 px-8 bg-white text-teal-700 hover:bg-gray-100 font-semibold shadow-xl">
                Start Reviewing Now →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}