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
import { Timer, Mail, Lock, User, Chrome, Check } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, isLoading } = useAuthStore();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [error, setError] = React.useState("");
  const [infoMessage, setInfoMessage] = React.useState("");

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }

    try {
      await register(name, email, password);
      
      // Wait a bit for auth state to update, then redirect
      setTimeout(() => {
        router.push("/timer");
      }, 1000);
    } catch (err: any) {
      if (err?.message === "confirmation_required") {
        setInfoMessage(
          "Account created! Please check your inbox and confirm your email before signing in."
        );
      } else {
        setError(err?.message || "Failed to create account. Please try again.");
      }
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setInfoMessage("");

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }

    try {
      await loginWithGoogle();
      // OAuth will redirect automatically
    } catch (err: any) {
      setError(err?.message || "Failed to sign up with Google");
    }
  };

  const passwordStrength = React.useMemo(() => {
    if (password.length === 0) return null;
    if (password.length < 6)
      return { text: "Too short", color: "text-destructive" };
    if (password.length < 8) return { text: "Weak", color: "text-orange-500" };
    if (!/\d/.test(password))
      return { text: "Add numbers", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  }, [password]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mb-8">
          <Timer className="h-8 w-8" />
          <span className="text-2xl font-bold">BlackFocus</span>
        </Link>

        {/* Register Card */}
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Get started with your focus journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            {infoMessage && (
              <div className="p-3 rounded-md bg-emerald-500/10 text-emerald-500 text-sm">
                {infoMessage}
              </div>
            )}

            {/* Google Register */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleRegister}
              disabled={isLoading || !agreedToTerms}>
              <Chrome className="mr-2 h-4 w-4" />
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

            {/* Email Register Form */}
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                    minLength={6}
                  />
                </div>
                {passwordStrength && (
                  <p className={`text-xs ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.text}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    agreedToTerms ? "bg-primary border-primary" : "border-input"
                  } transition-colors`}
                  disabled={isLoading}>
                  {agreedToTerms && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </button>
                <label className="text-sm text-muted-foreground leading-tight">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading || !agreedToTerms || password !== confirmPassword
                }>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium">
                Sign in
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

        {/* Benefits */}
        <div className="mt-8 max-w-md space-y-2">
          <p className="text-sm font-semibold text-center mb-4">
            Why create an account?
          </p>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>Sync your sessions across all devices</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>Access detailed analytics and insights</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>Unlock Pro features with one subscription</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
