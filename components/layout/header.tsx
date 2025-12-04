"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Timer,
  User,
  LogOut,
  Settings,
  Crown,
  CalendarDays,
  Menu,
  X,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      // Logout and wait for state to update
      await logout();

      // Small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force redirect
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      // Force redirect even on error
      window.location.href = "/";
    }
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-lg hover:text-primary transition-colors mr-4 md:mr-8">
          <Timer className="h-5 w-5" />
          <span className="hidden sm:inline">BlackFocus</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          <Link
            href="/timer"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/timer" ? "text-primary" : "text-muted-foreground"
            )}>
            Timer
          </Link>
          <Link
            href="/stats"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/stats" ? "text-primary" : "text-muted-foreground"
            )}>
            Stats
          </Link>
          <Link
            href="/analytics"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              pathname === "/analytics"
                ? "text-primary"
                : "text-muted-foreground"
            )}>
            Analytics
            {user?.isPro && <Crown className="h-3 w-3 text-yellow-500" />}
          </Link>
          <Link
            href="/pricing"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/pricing" ? "text-primary" : "text-muted-foreground"
            )}>
            Pricing
          </Link>
          <Link
            href="/calendar"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              pathname === "/calendar"
                ? "text-primary"
                : "text-muted-foreground"
            )}>
            <CalendarDays className="h-4 w-4" />
            Calendar
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {isAuthenticated && user ? (
            <>
              {/* User Menu */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    <span className="hidden md:inline text-sm">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[180px] sm:w-56"
                  sideOffset={5}>
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                        {user.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!user.isPro && (
                    <>
                      <UpgradeToProButton
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-auto px-2 py-1.5 font-normal text-[11px] sm:text-sm"
                      />
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="text-[11px] sm:text-sm py-2">
                    <Settings className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-[11px] sm:text-sm py-2">
                    <LogOut className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Login/Register Buttons */}
              <Link href="/login">
                <Button variant="ghost" size="default">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="default">Sign up</Button>
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link
              href="/timer"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/timer"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}>
              <Timer className="h-4 w-4" />
              Timer
            </Link>
            <Link
              href="/stats"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/stats"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}>
              <BarChart3 className="h-4 w-4" />
              Stats
            </Link>
            <Link
              href="/analytics"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/analytics"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}>
              <BarChart3 className="h-4 w-4" />
              Analytics
              {user?.isPro && (
                <Crown className="h-3 w-3 text-yellow-500 ml-auto" />
              )}
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/pricing"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}>
              <DollarSign className="h-4 w-4" />
              Pricing
            </Link>
            <Link
              href="/calendar"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/calendar"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}>
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Link>

            {/* Mobile Auth Section */}
            {!isAuthenticated && (
              <div className="pt-3 border-t space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
