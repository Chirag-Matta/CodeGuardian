import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span>CodeGuardian</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/review" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Review
          </Link>
          <Link href="https://github.com/chirag-matta/codeguardian" target="_blank" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            GitHub
          </Link>
          <Link href="/review">
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}