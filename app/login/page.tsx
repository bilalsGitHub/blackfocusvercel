"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Timer, Mail, Lock, Chrome } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, isAuthenticated } = useAuthStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [redirecting, setRedirecting] = React.useState(false);

  // Get returnTo from URL params
  const returnTo = React.useMemo(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("returnTo") || "/timer";
    }
    return "/timer";
  }, []);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !redirecting) {
      setRedirecting(true);
      console.log(`=== REDIRECTING TO ${returnTo} ===`);
      router.push(returnTo);
    }
  }, [isAuthenticated, router, redirecting, returnTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("=== LOGIN STARTED ===");

    try {
      await login(email, password);
      console.log("=== LOGIN SUCCESS ===");
      // onAuthStateChange will handle the state update
      // useEffect will handle the redirect
    } catch (err: any) {
      console.error("=== LOGIN ERROR ===", err);
      setError(err?.message || "Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      await loginWithGoogle();
      // OAuth will redirect automatically
    } catch (err: any) {
      setError(err?.message || "Failed to login with Google");
    }
  };

  const handleClearSession = async () => {
    try {
      console.log("[LOGIN] Clearing session...");
      const { supabaseBrowser } = await import("@/lib/supabase-browser");
      await supabaseBrowser.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      console.log("[LOGIN] ✅ Session cleared");
      setError("");
      alert("Session cleared! Please try logging in again.");
      window.location.reload();
    } catch (err: any) {
      console.error("[LOGIN] ❌ Clear session failed:", err);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-1.5 sm:space-x-2 mb-6 sm:mb-8">
          <Timer className="h-6 w-6 sm:h-8 sm:w-8" />
          <span className="text-xl sm:text-2xl font-bold">BlackFocus</span>
        </Link>

        {/* Login Card */}
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            {/* Error Message */}
            {error && (
              <div className="space-y-2">
                <div className="p-2.5 sm:p-3 rounded-md bg-destructive/10 text-destructive text-xs sm:text-sm">
                  {error}
                </div>
                <button
                  onClick={handleClearSession}
                  className="text-xs text-muted-foreground hover:text-foreground underline">
                  Having trouble? Clear session and try again
                </button>
              </div>
            )}

            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full text-sm sm:text-base h-9 sm:h-10"
              onClick={handleGoogleLogin}
              disabled={isLoading}>
              <Chrome className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form
              onSubmit={handleEmailLogin}
              className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>

            {/* Continue as Guest */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/timer")}>
              Continue as Guest
            </Button>
          </CardFooter>
        </Card>

        {/* Footer Note */}
        <p className="mt-8 text-xs text-center text-muted-foreground max-w-md">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
