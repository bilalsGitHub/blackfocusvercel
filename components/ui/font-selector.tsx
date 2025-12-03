"use client";

import * as React from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { FONT_NAMES, type FontFamily } from "@/lib/fonts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";

export function FontSelector() {
  const { fontFamily, updateSettings } = useSettingsStore();

  const handleFontChange = async (newFont: FontFamily) => {
    await updateSettings({ fontFamily: newFont });

    // Apply font to document body immediately
    if (typeof document !== "undefined") {
      document.body.style.fontFamily = `var(--font-${newFont}), sans-serif`;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Change Font">
          <Type className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(FONT_NAMES) as FontFamily[]).map((font) => (
          <DropdownMenuItem
            key={font}
            onClick={() => handleFontChange(font)}
            className={`cursor-pointer ${
              fontFamily === font ? "bg-accent" : ""
            }`}>
            <span style={{ fontFamily: `var(--font-${font})` }}>
              {FONT_NAMES[font]}
            </span>
            {fontFamily === font && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
