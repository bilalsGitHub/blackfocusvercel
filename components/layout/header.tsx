"use client";

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
import { Timer, User, LogOut, Settings, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-1.5 sm:space-x-2 font-bold text-base sm:text-lg hover:text-primary transition-colors">
          <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">BlackFocus</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <Link
            href="/timer"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary",
              pathname === "/timer" ? "text-primary" : "text-muted-foreground"
            )}>
            Timer
          </Link>
          <Link
            href="/stats"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary",
              pathname === "/stats"
                ? "text-primary"
                : "text-muted-foreground"
            )}>
            Stats
          </Link>
          <Link
            href="/analytics"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              pathname === "/analytics"
                ? "text-primary"
                : "text-muted-foreground"
            )}>
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">More</span>
            {user?.isPro && (
              <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500" />
            )}
          </Link>
          <Link
            href="/pricing"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary hidden sm:inline",
              pathname === "/pricing" ? "text-primary" : "text-muted-foreground"
            )}>
            Pricing
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
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
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
