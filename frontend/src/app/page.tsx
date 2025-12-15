// frontend/src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Zap, Bug, Code, Sparkles, ArrowRight, GitPullRequest } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.03] -z-10" />

        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6 backdrop-blur-sm">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            <span></span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50">
            Code Review on <br />
            <span className="text-indigo-400">Autopilot</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly analyze Pull Requests for security vulnerabilities, logic bugs, and performance bottlenecks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/review">
              <Button size="lg" className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all">
                <GitPullRequest className="mr-2 h-5 w-5" />
                Review a PR
              </Button>
            </Link>
            <Link href="/review?tab=diff">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all">
                Analyze Diff
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Trust Banner (Optional Visual Element) */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent my-8" />

      {/* Agents Grid */}
      <section className="container px-4 py-24 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">5 Intelligent Agents</h2>
          <p className="text-muted-foreground">Each trained on specific domains of software engineering.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AgentCard 
            icon={Shield} 
            title="Security Guardian" 
            desc="Detects SQL injection, XSS, and hardcoded secrets before they merge."
            color="text-red-400"
            bg="bg-red-500/10"
          />
          <AgentCard 
            icon={Zap} 
            title="Performance Expert" 
            desc="Identifies N+1 queries, memory leaks, and inefficient algorithms."
            color="text-amber-400"
            bg="bg-amber-500/10"
          />
          <AgentCard 
            icon={Bug} 
            title="Logic Validator" 
            desc="Catches edge cases, null pointer exceptions, and off-by-one errors."
            color="text-indigo-400"
            bg="bg-indigo-500/10"
          />
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
             <AgentCard 
              icon={Code} 
              title="Code Quality" 
              desc="Enforces best practices, DRY principles, and proper error handling."
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
             <AgentCard 
              icon={ArrowRight} 
              title="Readability" 
              desc="Ensures clear naming conventions and maintainable documentation."
              color="text-emerald-400"
              bg="bg-emerald-500/10"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function AgentCard({ icon: Icon, title, desc, color, bg }: any) {
  return (
    <Card className="glass-card border-white/5 hover:border-white/10">
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {desc}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}