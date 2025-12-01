# BlackFocus - Free Online Pomodoro Timer

🎯 A beautiful, minimal black Pomodoro timer built with Next.js 15, TypeScript, and TailwindCSS. Perfect for focus sessions, productivity tracking, and deep work.

**Live Demo:** https://blackfocus.app *(Coming Soon)*

[![SEO Optimized](https://img.shields.io/badge/SEO-Optimized-success)](https://blackfocus.app)
[![Google Ads Ready](https://img.shields.io/badge/Google%20Ads-Ready-blue)](https://blackfocus.app)
[![PWA Enabled](https://img.shields.io/badge/PWA-Enabled-orange)](https://blackfocus.app)

## ✨ Features

### Core Timer Features
- ⏱️ **Pomodoro Timer** - Classic 25/5 minute focus/break sessions
- 🎯 **Focus Mode** - Distraction-free full-screen timer
- ⚡ **Chronometer** - Unlimited timer for flexible work sessions
- 🔄 **Auto-start** - Automatically start breaks after focus sessions
- ⚫ **Black Minimal Design** - Beautiful dark theme easy on your eyes
- 📱 **PWA Support** - Install as an app and use offline
- ⌨️ **Keyboard Shortcuts** - Space to start/pause, R to reset, F for focus mode

### Productivity Tracking
- 📊 **Analytics Dashboard** - Beautiful heatmaps and productivity insights
- 📈 **Daily Statistics** - Simple, clear overview of your daily sessions
- 🔥 **Streak Tracking** - Build consistent work habits
- 📋 **Task Management** - Link timer sessions to specific tasks
- 💾 **Cloud Sync** - Sync across all devices (with account)

### SEO & Performance
- 🚀 **Lightning Fast** - Built with Next.js 15 and optimized for speed
- 🔍 **SEO Optimized** - Fully optimized for Google search
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Built with Shadcn/UI and Radix UI components

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: Shadcn/UI + Radix UI
- **State Management**: Zustand with persist middleware
- **Icons**: Lucide React
- **Theme**: next-themes with localStorage
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd blackfocusweb
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
blackfocusweb/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Landing page
│   ├── timer/             # Timer page
│   └── analytics/         # Analytics page (Pro placeholder)
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── providers/        # Context providers
│   └── theme-toggle.tsx  # Theme switcher component
├── hooks/                # Custom React hooks
│   └── use-timer.ts     # Timer logic hook
├── stores/               # Zustand stores
│   └── timer-store.ts   # Timer state management
├── lib/                  # Utility functions
│   └── utils.ts         # Helper functions
└── public/              # Static assets
    ├── manifest.json    # PWA manifest
    └── icons/          # App icons
```

## Configuration

### Timer Durations

Edit `stores/timer-store.ts` to customize default timer durations:

```typescript
focusDuration: 25 * 60,      // 25 minutes
shortBreakDuration: 5 * 60,  // 5 minutes
longBreakDuration: 15 * 60,  // 15 minutes
```

### Theme Colors

Customize theme colors in `app/globals.css` by modifying the CSS variables.

### PWA Settings

Configure PWA options in `next.config.ts`:

```typescript
withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})
```

## Deployment & Supabase Guide

You can deploy the UI to **Vercel** and use **Supabase** for authentication + persistent data. Follow the checklist below to go from local-only storage to a hosted, multi-device setup.

### 1. Install Supabase client dependencies

```bash
npm install @supabase/supabase-js
```

If you plan to run Supabase auth helpers on the server, also install:

```bash
npm install @supabase/auth-helpers-nextjs
```

### 2. Environment variables

Add the following keys to `.env.local` for local dev and to Vercel’s Project Settings → Environment Variables for production:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key   # only on server / Vercel
SUPABASE_JWT_SECRET=your-jwt-secret          # found in Supabase settings
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Never expose the `SERVICE_ROLE_KEY` on the client—only use it inside API routes or Vercel serverless functions.

### 3. Supabase project setup

1. Create a new Supabase project.
2. Under **Authentication → Providers** enable **Email** and optionally **Google**. For Google set the OAuth redirect to `https://your-app.vercel.app/auth/callback` (and `http://localhost:3000/auth/callback` for dev).
3. Under **Authentication → URL Configuration** set `SITE_URL` to your deployed domain (Vercel URL) so magic links redirect correctly.

### 4. Database schema

Run the SQL below inside Supabase SQL Editor to create tables that mirror the client-side Zustand stores:

```sql
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  photo_url text,
  is_pro boolean default false,
  focus_goal_minutes int default 150,
  created_at timestamptz default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  title text not null,
  description text,
  estimated_pomodoros int default 1,
  completed_pomodoros int default 0,
  priority text default 'medium',
  scheduled_date date,
  is_completed boolean default false,
  is_chrono_log boolean default false,
  chrono_duration_seconds int default 0,
  order_index int default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  mode text check (mode in ('focus','shortBreak','longBreak','chronometer')),
  duration_seconds int not null,
  completed_at timestamptz not null,
  was_completed boolean default true,
  task_id uuid references public.tasks on delete set null
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);
```

### 5. Row Level Security (RLS)

Turn on RLS for each table and add policies so users only access their own data:

```sql
alter table public.tasks enable row level security;
alter table public.sessions enable row level security;
alter table public.settings enable row level security;

create policy "Users can CRUD their tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their settings"
  on public.settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Profiles can use Supabase’s default policies (`auth.uid() = id`).

### 6. Wiring the frontend to Supabase

1. Create a helper at `lib/supabase-browser.ts`:

   ```ts
   import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

   export const supabase = createBrowserClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

2. Replace the mock `auth-store` with Supabase auth state. You can subscribe to `supabase.auth.onAuthStateChange` and hydrate Zustand with user info plus the `isPro` flag from `profiles`.
3. Move persistence logic out of `localStorage` stores:
   - **Tasks:** fetch from `/api/tasks` (Next.js Route Handler) that proxies Supabase. CRUD actions should call Supabase and then update the local store.
   - **Sessions:** on session complete, insert a row into `public.sessions`.
   - **Settings:** store the JSON blob for per-user preferences; hydrate on app load.

4. For SSR pages (e.g., `/analytics`) use `createServerClient` from `@supabase/auth-helpers-nextjs` inside Route Handlers or Server Components to fetch initial data securely.

### 7. Deployment (Vercel)

1. Push this repo to GitHub.
2. Create a new Vercel project, import the repo, and select the **Next.js** preset.
3. Add all environment variables listed above (including Supabase keys and `NEXT_PUBLIC_APP_URL`).
4. Trigger a deploy. Vercel will build with Turbopack and output a production URL.
5. Update Supabase **SITE_URL** and OAuth redirect URLs to point to the final Vercel domain.

### 8. Optional: Backup & migrations

- Enable Supabase’s nightly backups (Project Settings → Backups).
- Use `supabase migration new <name>` if you prefer committed SQL migrations.

After completing these steps, your timer, tasks, sessions, and settings will sync across devices through Supabase, and deployment becomes a single-click operation in Vercel.

## Building for Production

```bash
npm run build
npm start
```

## PWA Installation

1. Build and run the production version
2. Open the app in a browser
3. Click the install button in the address bar
4. The app will be installed and can work offline

## 🔍 SEO & Marketing

This project is fully optimized for Google Ads and organic search. See detailed documentation:

- **[SEO Keywords Guide](./SEO_KEYWORDS.md)** - Complete keyword research and strategy
- **[Google Ads Setup](./GOOGLE_ADS_SETUP.md)** - Step-by-step Google Ads campaign setup

### Key SEO Features
- ✅ Comprehensive meta tags with 50+ keywords
- ✅ Structured data (JSON-LD) for Google
- ✅ Open Graph tags for social sharing
- ✅ Sitemap.xml and robots.txt
- ✅ Semantic HTML and proper heading structure
- ✅ Fast loading times (Next.js optimization)
- ✅ Mobile-first responsive design
- ✅ Keyword-rich content on all pages

### Target Keywords
**Primary:** pomodoro timer, focus timer, black timer, minimal timer, timer online
**Secondary:** productivity timer, study timer, work timer, pomodoro technique
**Long-tail:** free online pomodoro timer, black focus timer, minimal pomodoro timer

## 🚀 Google Ads Ready

Complete Google Ads campaigns included in [GOOGLE_ADS_SETUP.md](./GOOGLE_ADS_SETUP.md):

1. **Pomodoro Timer Campaign** - Main keyword targeting
2. **Focus Timer Campaign** - Alternative keyword targeting  
3. **Black Timer Campaign** - Unique positioning
4. **Timer Online Campaign** - Broad reach

**Estimated CPC:** $0.30 - $1.00
**Expected CTR:** 3-5%
**Conversion tracking ready**

## 📊 Analytics Integration

Built-in support for:
- Google Analytics 4
- Google Ads conversion tracking
- Custom event tracking for user actions
- Performance monitoring

## 🎯 Future Enhancements

- [ ] Sound notifications for timer completion
- [ ] Email magic link authentication
- [ ] Team collaboration features
- [ ] Browser extension
- [ ] Mobile apps (iOS/Android)
- [ ] Spotify integration for focus music
- [ ] AI-powered productivity insights

## License

MIT

## Author

Built with ❤️ using Next.js 15
#   b l a c k f o c u s v e r c e l  
 