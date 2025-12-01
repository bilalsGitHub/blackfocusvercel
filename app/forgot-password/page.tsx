"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = React.useState("");
  const [emailSent, setEmailSent] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mb-8">
          <Timer className="h-8 w-8" />
          <span className="text-2xl font-bold">BlackFocus</span>
        </Link>

        {/* Forgot Password Card */}
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {emailSent ? "Check your email" : "Reset password"}
            </CardTitle>
            <CardDescription className="text-center">
              {emailSent
                ? "We've sent you a password reset link"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  If an account exists for <strong>{email}</strong>, you will
                  receive a password reset link shortly.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {emailSent ? (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Try another email
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Help Text */}
        {!emailSent && (
          <p className="mt-8 text-xs text-center text-muted-foreground max-w-md">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@blackfocus.app"
              className="text-primary hover:underline"
            >
              support@blackfocus.app
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

