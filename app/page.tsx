"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Timer, 
  TrendingUp, 
  Zap, 
  Gauge, 
  BarChart3, 
  Cloud,
  Play,
  Lock
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const handleStartSession = () => {
    router.push("/timer");
  };

  const handleAnalytics = () => {
    // TODO: Check if user is logged in
    // If not, show login modal
    router.push("/analytics");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge 
            variant="secondary" 
            className="text-sm px-4 py-1.5 bg-primary/10 text-primary border-primary/20"
          >
            Distraction-Free Focus Timer
          </Badge>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Black Focus Web
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Distraction-free Pomodoro timer with analytics and cloud sync.
            Stay focused, track progress, achieve more.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg" 
              onClick={handleStartSession}
              className="w-full sm:w-auto text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Focus Session
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleAnalytics}
              className="w-full sm:w-auto text-lg h-14 px-8 group"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              View Analytics
              <Lock className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Button>
          </div>

          {/* Pricing Link */}
          <p className="text-sm text-muted-foreground">
            Starting at $0/month · <Link href="/pricing" className="underline hover:text-foreground">View Pricing</Link>
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>60fps Smooth Timer</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Local Data Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span>Cloud Sync Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to stay focused
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with modern web technologies for the best experience
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Gauge className="h-8 w-8" />}
              title="Smooth Timer Engine"
              description="Powered by requestAnimationFrame for butter-smooth 60fps timing. No lag, no drift, just perfect accuracy."
              highlight="requestAnimationFrame"
            />

            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Powerful Analytics"
              description="Weekly charts, daily heatmaps, and productivity insights. Track your focus patterns over time."
              highlight="Pro Feature"
              isPro
            />

            <FeatureCard
              icon={<Cloud className="h-8 w-8" />}
              title="Cloud Sync"
              description="Seamlessly sync your sessions across all devices. Never lose your progress."
              highlight="Coming Soon"
              isPro
            />

            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Local Storage"
              description="Your data is saved locally in your browser. No data loss between sessions, everything persists."
              highlight="Data Persists"
            />

            <FeatureCard
              icon={<Timer className="h-8 w-8" />}
              title="Customizable Sessions"
              description="Adjust focus and break durations to match your workflow. Auto-start and notifications included."
              highlight="Fully Flexible"
            />

            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Premium Without Friction"
              description="Simple pricing, powerful features. Stripe integration for seamless cross-platform access."
              highlight="$4.99/month"
              isPro
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to boost your productivity?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Start your first focus session now. No signup required.
          </p>
          <Button 
            size="lg"
            onClick={handleStartSession}
            className="text-lg h-14 px-10 shadow-lg hover:shadow-xl transition-all"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            © 2024 Black Focus Web. Built with Next.js 15 & Zustand.
          </div>
          <div className="flex gap-6">
            <Link href="/timer" className="hover:text-foreground transition-colors">
              Timer
            </Link>
            <Link href="/analytics" className="hover:text-foreground transition-colors">
              Analytics
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
  isPro?: boolean;
}

function FeatureCard({ icon, title, description, highlight, isPro }: FeatureCardProps) {
  return (
    <div className="group relative p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300">
      {/* Pro Badge */}
      {isPro && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
            Pro
          </Badge>
        </div>
      )}

      {/* Icon */}
      <div className="mb-6 text-primary">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      {/* Highlight */}
      <div className="text-sm font-medium text-primary/80">
        {highlight}
      </div>
    </div>
  );
}
