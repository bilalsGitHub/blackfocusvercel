# 🎯 Premium Features Implementation

## Overview

BlackFocus Web implements a freemium model with a clear distinction between Free and Pro tiers.

## Free Tier ($0/month)

### ✅ Included Features:
- **Unlimited Timer Sessions**: Use the Pomodoro timer as much as you want
- **Up to 2 Tasks**: Create and manage up to 2 tasks at a time
- **Basic Timer Features**: Focus, short break, long break modes
- **Keyboard Shortcuts**: Quick access to timer controls (Space, R, F, S)
- **Focus Mode**: Distraction-free timer view
- **Local Data Storage**: All data saved in browser localStorage

### ❌ Limitations:
- Max 2 tasks only
- No analytics dashboard
- No data export/import
- Ads displayed on timer page

## Pro Tier ($5/month)

### 🚀 Everything in Free, PLUS:

#### Unlimited Tasks
- Create as many tasks as needed
- No restrictions on task management
- Full drag & drop reordering

#### Full Analytics Dashboard
- Weekly activity heatmap
- Productivity statistics
- Streak tracking
- Time breakdown by task
- Session history
- Focus time trends

#### Data Management
- **Export**: JSON and CSV formats
- **Import**: Restore data from JSON backups
- Full data portability

#### Ad-Free Experience
- Zero ads on any page
- Clean, distraction-free interface

#### Priority Support
- Faster response times
- Direct email support
- Feature request priority

## Implementation Details

### Task Limit Enforcement

**File**: `components/tasks/add-task-input.tsx`

```typescript
// Check task limit for free users
if (!isPro && tasks.length >= 2) {
  const shouldUpgrade = window.confirm(
    "🎯 Task Limit Reached!\n\nFree users can create up to 2 tasks.\n\nUpgrade to Pro for:\n• Unlimited tasks\n• Full analytics\n• Ad-free experience\n• Only $5/month\n\nGo to Pricing page?"
  );
  
  if (shouldUpgrade) {
    router.push("/pricing");
  }
  return;
}
```

### Analytics Access Control

**File**: `app/analytics/page.tsx`

```typescript
// If not Pro, show upgrade prompt
if (!isPro) {
  return (
    <div className="container mx-auto px-4 py-8">
      // ... Upgrade prompt UI
    </div>
  );
}
```

### Ad Display Logic

**File**: `components/ads/ad-banner.tsx`

```typescript
// Don't show ads to Pro users
if (isPro || !isVisible) return null;
```

Ads are displayed:
- Below timer stats on `/timer` page
- In sidebar on larger screens
- Can be temporarily closed (but reappear on reload for free users)

### Export/Import Restrictions

**Files**: 
- `components/analytics/export-button.tsx`
- `components/analytics/import-button.tsx`

Both components check `isPro` status:
```typescript
const isPro = user?.isPro || false;

if (!isPro) {
  return <UpgradeToProButton />;
}
```

## Testing Pro Features

### Upgrade to Pro (Development Only)

**File**: `components/upgrade-to-pro-button.tsx`

The "Upgrade to Pro" button immediately sets `isPro: true` for testing purposes:

```typescript
const handleUpgrade = () => {
  setPro(true);
  // TODO: Integrate Stripe payment
};
```

### User State Management

**File**: `stores/auth-store.ts`

```typescript
interface AuthState {
  user: {
    isPro: boolean;
    // ... other fields
  } | null;
}
```

The `isPro` flag is persisted in localStorage via Zustand's persist middleware.

## Stripe Integration (TODO)

### Next Steps:
1. Create Stripe account
2. Set up product ($5/month subscription)
3. Add Stripe SDK to project
4. Replace test "Upgrade" with real Stripe Checkout
5. Implement webhook for subscription events
6. Add subscription management page

### Recommended Flow:
```
User clicks "Upgrade to Pro"
  ↓
Redirect to Stripe Checkout
  ↓
User completes payment
  ↓
Stripe webhook → Update user.isPro = true
  ↓
Redirect back to app with success message
```

## UI/UX Considerations

### Upgrade Prompts
- **Soft prompts**: Crown icon (👑) next to Pro features
- **Hard blocks**: Analytics page requires Pro
- **Helpful messaging**: Clear value proposition in upgrade dialogs

### Visual Indicators
- Crown icons for Pro features/users
- Badge on Analytics link in header (for Pro users)
- Lock icon on Analytics CTA (landing page)
- "Upgrade to Pro" in user dropdown (for Free users)

### Pricing Page
- **URL**: `/pricing`
- **Features**: Side-by-side comparison, FAQ, 14-day trial mention
- **CTA**: Clear upgrade buttons with Stripe integration placeholder

## Data Persistence

All user preferences, tasks, and sessions are stored in browser localStorage:

```
- timer-storage: Timer state + sessions
- task-storage: Tasks + active task
- settings-storage: User preferences
- auth-storage: User info + isPro status
```

**Note**: Future cloud sync will be Pro-only feature.

## Monetization Strategy

### Target Conversion Rate: 2-5%
- Most users start free
- Power users upgrade for analytics
- Productivity enthusiasts want unlimited tasks

### Pricing Psychology
- $5/month is affordable (< 2 coffees)
- "Most Popular" badge on Pro tier
- 14-day trial (TODO: implement with Stripe)
- Annual option: $50/year (save $10) (TODO)

### Upgrade Triggers
1. Hitting 2-task limit
2. Trying to access analytics
3. Wanting to remove ads
4. Needing data export/import

## Analytics & Metrics (TODO)

Track these to optimize conversion:

- Free signups
- Upgrade clicks
- Task limit hit rate
- Analytics page visits (from free users)
- Ad banner closes
- Pricing page views
- Time to upgrade (days)

## Support & Documentation

### For Users
- Pricing page FAQ
- In-app upgrade prompts with benefits
- Email support (faster for Pro)

### For Developers
- This document (PREMIUM_FEATURES.md)
- Stripe integration guide (TODO)
- Analytics tracking setup (TODO)

---

**Last Updated**: Nov 30, 2025  
**Status**: ✅ Core premium logic implemented, awaiting Stripe integration

