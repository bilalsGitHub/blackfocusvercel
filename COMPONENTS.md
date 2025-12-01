# UI Components Documentation

## Overview

BlackFocus uses a modern, accessible component architecture built on **Shadcn/UI** and **Radix UI** primitives. All components follow accessibility best practices with ARIA labels, keyboard navigation, and semantic HTML.

## Component Architecture

### Base UI Components (Shadcn/UI)

Located in `components/ui/`, these are the foundation components:

- **Button** - Versatile button with multiple variants
- **Card** - Container component for grouped content
- **Dialog** - Modal dialogs with overlay
- **Input** - Form input with validation styles
- **Label** - Accessible form labels
- **Progress** - Progress bar (Radix UI)
- **Select** - Dropdown select (Radix UI)
- **Badge** - Small status indicators

### Timer Components

Custom components for the timer functionality in `components/timer/`:

#### TimerDisplay

```typescript
<TimerDisplay 
  time="25:00" 
  mode="focus" 
  progress={0.5}
  className="max-w-md"
/>
```

**Features:**
- Large, centered time display (mm:ss format)
- Circular SVG progress ring
- Mode indicator
- ARIA live region for screen readers
- Responsive text sizing

**Accessibility:**
- `role="timer"`
- `aria-label` for timer mode
- `aria-live="polite"` for updates
- Screen reader progress announcements

---

#### TimerControls

```typescript
<TimerControls
  isRunning={false}
  onPlayPause={() => {}}
  onReset={() => {}}
  disabled={false}
/>
```

**Features:**
- Play/Pause toggle button
- Reset button
- Clear visual states
- Keyboard accessible

**Accessibility:**
- `role="group"`
- `aria-label` for each button
- Disabled state support
- Focus management

---

#### ModeSwitcher

```typescript
<ModeSwitcher
  currentMode="focus"
  onModeChange={(mode) => {}}
  disabled={false}
/>
```

**Features:**
- Three mode buttons: Focus, Short Break, Long Break
- Visual active state
- Disabled during running timer
- Tab-based navigation pattern

**Accessibility:**
- `role="tablist"` pattern
- `aria-selected` for current mode
- `tabIndex` management
- Keyboard navigation (Arrow keys)

---

#### SettingsDialog

```typescript
<SettingsDialog />
```

**Features:**
- Duration customization (focus, short break, long break)
- Sound selection dropdown
- Reset to defaults
- Form validation (min/max values)

**Accessibility:**
- Radix Dialog with full keyboard support
- Labeled form inputs
- `aria-describedby` for help text
- Focus trap when open
- ESC to close

**Settings:**
- Focus: 1-120 minutes (default: 25)
- Short Break: 1-60 minutes (default: 5)
- Long Break: 1-120 minutes (default: 15)
- Sound: Bell, Chime, Ding, None

---

#### TimerStats

```typescript
<TimerStats completedSessions={10} />
```

**Features:**
- Completed sessions counter
- Total focus time calculation
- Responsive grid layout
- Card-based design

**Accessibility:**
- `role="region"`
- `aria-label` with full statistics
- Semantic HTML

---

#### KeyboardShortcutsInfo

```typescript
<KeyboardShortcutsInfo />
```

**Features:**
- Dialog showing all keyboard shortcuts
- Styled kbd elements
- Quick reference guide

**Shortcuts:**
- `Space` / `K` - Play/Pause
- `R` - Reset
- `S` - Settings
- `Tab` - Navigate
- `Enter` - Activate
- `Esc` - Close dialogs

---

### Theme Components

#### ThemeToggle

```typescript
<ThemeToggle />
```

**Features:**
- Sun/Moon icon toggle
- Smooth transitions
- localStorage persistence
- System preference detection

**Accessibility:**
- `aria-label="Toggle theme"`
- Keyboard accessible
- Visual focus indicator

---

#### ThemeProvider

Wraps the entire app for theme management:

```typescript
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

## Design System

### Color Tokens

Uses HSL color tokens defined in `app/globals.css`:

```css
--background
--foreground
--primary
--secondary
--muted
--accent
--destructive
--border
```

Each token has a dark mode variant in the `.dark` class.

### Spacing Scale

Tailwind's default spacing scale is used:
- `gap-2` (0.5rem / 8px)
- `gap-4` (1rem / 16px)
- `gap-6` (1.5rem / 24px)
- `gap-8` (2rem / 32px)

### Typography

**Font Sizes:**
- Hero: `text-7xl` (72px)
- Timer: `text-8xl` (96px)
- Heading: `text-2xl` (24px)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)

**Font Families:**
- Sans: Geist Sans (variable font)
- Mono: Geist Mono (for timer display)

### Border Radius

- Small: `rounded-md` (0.375rem)
- Medium: `rounded-lg` (0.5rem)
- Large: `rounded-xl` (0.75rem)
- Full: `rounded-full`

## Compose-like Modifier System

Components use a Tailwind-based modifier system similar to Jetpack Compose:

```typescript
<Button 
  variant="default"    // Style variant
  size="lg"           // Size modifier
  className="w-full"  // Custom modifiers
>
  Click me
</Button>
```

### Variant Props

All components support `VariantProps` from `class-variance-authority`:

```typescript
const buttonVariants = cva(
  "base classes",
  {
    variants: {
      variant: { default, destructive, outline, ... },
      size: { default, sm, lg, icon },
    },
    defaultVariants: { ... }
  }
)
```

### Utility Function

The `cn()` helper merges and deduplicates classes:

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  variant && "variant-classes",
  className
)} />
```

## Accessibility Features

### Keyboard Navigation

- **Tab** - Navigate between interactive elements
- **Space/Enter** - Activate buttons
- **Arrow Keys** - Navigate within component groups
- **Escape** - Close dialogs

### Screen Reader Support

- Semantic HTML elements
- ARIA labels and descriptions
- Live regions for dynamic updates
- Focus management in modals

### Visual Indicators

- Focus rings on interactive elements
- High contrast mode support
- Clear hover/active states
- Sufficient color contrast ratios

## Responsive Design

Mobile-first approach with breakpoints:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

Example usage:

```typescript
<div className="text-4xl md:text-6xl lg:text-7xl">
  Responsive Text
</div>
```

## Dark Mode

Automatic dark mode using `next-themes`:

```typescript
const { theme, setTheme } = useTheme()

// Toggle
setTheme(theme === "dark" ? "light" : "dark")
```

Classes apply automatically:
```css
.bg-background  /* Light: white, Dark: #0a0a0a */
.text-foreground /* Light: black, Dark: #ededed */
```

## Performance

- **Tree-shaking**: Only imported components are bundled
- **CSS-in-JS**: Zero runtime CSS-in-JS
- **Lazy Loading**: Dialog contents load on demand
- **Optimized Renders**: React.memo and useCallback where needed

## Usage Examples

### Full Timer Page Structure

```typescript
<div className="space-y-8">
  <div className="flex justify-between">
    <h1>Focus Timer</h1>
    <div className="flex gap-2">
      <KeyboardShortcutsInfo />
      <SettingsDialog />
    </div>
  </div>
  
  <ModeSwitcher 
    currentMode={mode}
    onModeChange={setMode}
    disabled={isRunning}
  />
  
  <TimerDisplay
    time={formatTime(timeLeft)}
    mode={mode}
    progress={progress}
  />
  
  <TimerControls
    isRunning={isRunning}
    onPlayPause={handlePlayPause}
    onReset={handleReset}
  />
  
  <TimerStats completedSessions={completedSessions} />
</div>
```

## Customization

### Changing Colors

Edit `app/globals.css`:

```css
:root {
  --primary: 240 5.9% 10%;  /* HSL values */
}
```

### Adding Variants

Extend component variants:

```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        custom: "bg-purple-500 text-white",  // New variant
      }
    }
  }
)
```

### Custom Animations

Add to Tailwind config or use inline:

```typescript
<div className="animate-pulse hover:scale-105 transition-transform">
  Content
</div>
```

## Best Practices

1. **Always use semantic HTML** - `<button>` for buttons, not `<div>`
2. **Include ARIA labels** - Especially for icon-only buttons
3. **Test keyboard navigation** - Tab through all interactive elements
4. **Maintain color contrast** - 4.5:1 minimum for text
5. **Provide focus indicators** - Visible focus rings
6. **Use loading states** - Show feedback for async actions
7. **Handle errors gracefully** - User-friendly error messages
8. **Test with screen readers** - Use NVDA, JAWS, or VoiceOver

## Resources

- [Shadcn/UI Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

