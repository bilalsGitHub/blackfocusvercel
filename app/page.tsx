"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Timer,
  TrendingUp,
  Zap,
  BarChart3,
  Cloud,
  Play,
  Lock,
  Music,
  Star,
  Cpu,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import Head from "next/head";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // If user is already authenticated, redirect to timer
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/timer");
    }
  }, [isAuthenticated, router]);

  const handleStartSession = () => {
    router.push("/timer");
  };

  const handleAnalytics = () => {
    if (isAuthenticated) {
      router.push("/analytics");
    } else {
      // Redirect to login with return URL
      router.push("/login?returnTo=/analytics");
    }
  };

  return (
    <>
      <Head>
        <title>
          BlackFocus - The Timer You've Been Looking For | Free Pomodoro Timer
        </title>
        <meta
          name="description"
          content="The timer you've been searching for. Minimalist Pomodoro timer with Spotify, analytics, and beautiful dark theme. Free forever, no distractions."
        />
      </Head>

      <div className="min-h-[calc(100vh-3.5rem)]">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Heading with SEO keywords */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight md:leading-tight lg:leading-tight">
              <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent pb-2">
                The Timer You've Been Looking For
              </span>
            </h1>

            {/* Subtitle with keywords */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Minimalist, elegant, and powerful. The Pomodoro timer you've been
              searching for.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                onClick={handleStartSession}
                className="w-full sm:w-auto text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                <Play className="mr-2 h-5 w-5" />
                Start Free Timer Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAnalytics}
                className="w-full sm:w-auto text-lg h-14 px-8 group">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Analytics
                <Lock className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Button>
            </div>

            {/* Pricing Link */}
            <p className="text-sm text-muted-foreground">
              100% Free to start ·{" "}
              <Link href="/pricing" className="underline hover:text-foreground">
                View Premium Features
              </Link>
            </p>

            {/* SEO Keywords Section */}
            <div className="pt-8">
              <p className="text-base text-muted-foreground mb-5">
                Perfect for:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="text-sm px-4 py-2">
                  Pomodoro Technique
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  Study Timer
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  Work Focus
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  Time Management
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  Productivity Timer
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  Deep Work
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-10 pt-12 text-base text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Fast & Lightweight</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Cpu className="h-5 w-5" />
                <span className="font-medium">Very Low RAM Usage</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Music className="h-5 w-5" />
                <span className="font-medium">
                  Built-in Focus Music Spotify
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Cloud className="h-5 w-5" />
                <span className="font-medium">Cloud Sync Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Best Unique Black Minimal Timer
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need in a focus timer - clean, minimal, and
                distraction-free
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Timer className="h-8 w-8" />}
                title="Precise Timer Engine"
                description="Powered by requestAnimationFrame for butter-smooth timing. The most accurate online Pomodoro timer available."
                highlight="Perfect Accuracy"
              />

              <FeatureCard
                icon={<BarChart3 className="h-8 w-8" />}
                title="Productivity Analytics"
                description="Track your focus sessions with detailed analytics. Weekly charts, daily heatmaps, and productivity insights."
                highlight="Pro Feature"
                isPro
              />

              <FeatureCard
                icon={<Cloud className="h-8 w-8" />}
                title="Cloud Sync"
                description="Seamlessly sync your Pomodoro sessions across all devices. Never lose your progress."
                highlight="Coming Soon"
                isPro
              />

              <FeatureCard
                icon={<Zap className="h-8 w-8" />}
                title="Minimal Black Design"
                description="Beautiful dark theme that's easy on your eyes. Minimalist interface keeps you focused on what matters."
                highlight="Distraction-Free"
              />

              <FeatureCard
                icon={<Music className="h-8 w-8" />}
                title="Focus Music Player"
                description="Built-in Spotify player with curated focus playlists. Listen to lofi, piano, and deep focus music while you work - completely free!"
                highlight="Free for Everyone"
              />

              <FeatureCard
                icon={<Timer className="h-8 w-8" />}
                title="Customizable Sessions"
                description="Adjust focus and break durations to match your workflow. Perfect for Pomodoro technique or custom intervals."
                highlight="Fully Flexible"
              />

              <FeatureCard
                icon={<TrendingUp className="h-8 w-8" />}
                title="Premium Features"
                description="Unlock advanced analytics and cloud sync. Simple pricing for powerful productivity tools."
                highlight="$4.99/month"
                isPro
              />
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose BlackFocus Timer?
              </h2>
            </div>

            <div className="space-y-8 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  🎯 Free Pomodoro Timer Online
                </h3>
                <p className="leading-relaxed">
                  BlackFocus is a completely free online Pomodoro timer that
                  works in your browser. No download required, no signup needed
                  to get started. Our black timer features a clean, minimalist
                  design that eliminates distractions and helps you focus on
                  your work.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  ⚫ Minimal Black Timer Design
                </h3>
                <p className="leading-relaxed">
                  Experience the beauty of minimalism with our black focus
                  timer. The dark theme is easy on your eyes during long work
                  sessions and creates the perfect environment for deep
                  concentration. Unlike cluttered timer apps, our minimal timer
                  keeps your workspace clean and distraction-free.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  🍅 Perfect Pomodoro Technique Timer
                </h3>
                <p className="leading-relaxed">
                  Master the Pomodoro Technique with our online timer. Default
                  25-minute focus sessions with 5-minute breaks help you
                  maintain peak productivity. Customize timer durations to match
                  your personal workflow. Our Pomodoro clock is perfect for
                  studying, coding, writing, and any focused work.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  📊 Track Your Productivity
                </h3>
                <p className="leading-relaxed">
                  Not just a simple timer - BlackFocus includes powerful
                  analytics to track your focus sessions over time. See your
                  productivity patterns, identify peak performance hours, and
                  build consistent work habits. Our time tracker helps you
                  understand and improve your time management.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  ⚡ Fast & Reliable Focus Timer
                </h3>
                <p className="leading-relaxed">
                  Built with modern web technology for lightning-fast
                  performance. Our timer engine uses requestAnimationFrame for
                  smooth 60fps animations and precise timing. Whether you need a
                  study timer, work timer, or concentration timer - BlackFocus
                  delivers reliable performance every time.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  🌐 Works Everywhere - Online Timer
                </h3>
                <p className="leading-relaxed">
                  Use our online Pomodoro timer on any device - desktop, laptop,
                  tablet, or phone. No app download required. Just open your
                  browser and start your focus session. Perfect for remote work,
                  online study sessions, and productivity on the go.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                What Our Users Say
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Join thousands of productive users loving BlackFocus
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TestimonialCard
                name="Sarah Chen"
                role="Software Engineer"
                avatar="SC"
                rating={5}
                text="Best Pomodoro timer I've used! The built-in Spotify player is a game-changer. I can focus for hours with lofi beats in the background."
              />

              <TestimonialCard
                name="Marcus Johnson"
                role="Product Designer"
                avatar="MJ"
                rating={5}
                text="The minimal black design is exactly what I needed. No distractions, just pure focus. The analytics help me track my productivity patterns."
              />

              <TestimonialCard
                name="Emma Rodriguez"
                role="Medical Student"
                avatar="ER"
                rating={5}
                text="I've been using this for my study sessions and it's incredible. The free music feature and smooth timer make studying actually enjoyable!"
              />

              <TestimonialCard
                name="David Kim"
                role="Content Creator"
                avatar="DK"
                rating={5}
                text="Finally a timer that actually helps me focus! The keyboard shortcuts are super convenient and the dark theme is easy on my eyes during long work sessions."
              />

              <TestimonialCard
                name="Lisa Anderson"
                role="Marketing Manager"
                avatar="LA"
                rating={5}
                text="Clean, fast, and totally free! I love how I can customize the timer durations. The Spotify integration is the cherry on top. Highly recommend!"
              />

              <TestimonialCard
                name="Ahmed Hassan"
                role="PhD Researcher"
                avatar="AH"
                rating={5}
                text="This timer has transformed my research workflow. The focus mode removes all distractions and the analytics show me exactly when I'm most productive."
              />
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <Button
                size="lg"
                onClick={handleStartSession}
                className="text-lg h-14 px-10 shadow-lg hover:shadow-xl transition-all">
                <Play className="mr-2 h-5 w-5" />
                Start Your Free Session Now
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No signup required • Free forever
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground mb-6">
              <div>© 2024 BlackFocus. Free online Pomodoro timer.</div>
              <div className="flex gap-6">
                <Link
                  href="/timer"
                  className="hover:text-foreground transition-colors">
                  Timer
                </Link>
                <Link
                  href="/stats"
                  className="hover:text-foreground transition-colors">
                  Stats
                </Link>
                <Link
                  href="/analytics"
                  className="hover:text-foreground transition-colors">
                  Analytics
                </Link>
                <Link
                  href="/pricing"
                  className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center space-y-2">
              <p>
                Keywords: pomodoro timer, focus timer, black timer, minimal
                timer, timer online, productivity timer, study timer, work
                timer, pomodoro technique, time management, concentration timer
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
  isPro?: boolean;
}

function FeatureCard({
  icon,
  title,
  description,
  highlight,
  isPro,
}: FeatureCardProps) {
  return (
    <div className="group relative p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300">
      {/* Pro Badge */}
      {isPro && (
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="text-xs bg-primary/10 text-primary border-primary/20">
            Pro
          </Badge>
        </div>
      )}

      {/* Icon */}
      <div className="mb-6 text-primary">{icon}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      {/* Highlight */}
      <div className="text-sm font-medium text-primary/80">{highlight}</div>
    </div>
  );
}

interface TestimonialCardProps {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

function TestimonialCard({
  name,
  role,
  avatar,
  rating,
  text,
}: TestimonialCardProps) {
  return (
    <div className="group relative p-6 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300">
      {/* Avatar and Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {avatar}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{name}</h4>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>

      {/* Rating Stars */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-sm text-muted-foreground leading-relaxed">"{text}"</p>
    </div>
  );
}
