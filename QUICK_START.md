# Quick Start Guide

## Installation Steps

### 1. Install Dependencies

```bash
# Using Yarn (recommended)
yarn install

# OR using NPM
npm install
```

### 2. Start Development Server

```bash
# Using Yarn
yarn dev

# OR using NPM
npm run dev
```

### 3. Open Browser

Navigate to: **http://localhost:3000**

---

## Troubleshooting

### Error: "Module not found"

**Solution:** Run `yarn install` or `npm install` first.

### Error: "next-pwa not found"

**Solution:** Already fixed in `next.config.ts` - PWA is now optional.

### Error: Port 3000 already in use

**Solution:** Kill the process or use a different port:

```bash
yarn dev -p 3001
```

---

## Project Structure

```
blackfocusweb/
├── app/
│   ├── page.tsx           # Landing page (NEW)
│   ├── layout.tsx         # Root layout with Header
│   ├── timer/page.tsx     # Timer application
│   └── analytics/page.tsx # Analytics (Pro feature)
├── components/
│   ├── layout/
│   │   └── header.tsx     # Global header with navigation
│   ├── timer/             # Timer components
│   ├── ui/                # Shadcn UI components
│   └── providers/         # Context providers
├── stores/
│   ├── timer-store.ts     # Timer state (Zustand)
│   └── settings-store.ts  # Settings state
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities
```

---

## Available Scripts

- **`yarn dev`** - Start development server (Turbopack)
- **`yarn build`** - Build for production
- **`yarn start`** - Start production server
- **`yarn lint`** - Run ESLint

---

## Features Implemented

✅ Landing page with hero section and features  
✅ Timer application with requestAnimationFrame  
✅ Dark/Light mode with next-themes  
✅ Global header with navigation  
✅ Zustand state management with localStorage  
✅ Settings dialog with durations and notifications  
✅ Keyboard shortcuts (Space, R, S)  
✅ Responsive design (mobile-first)  
✅ Accessible components (ARIA labels)  
✅ Cross-tab synchronization  
✅ Auto-start functionality  
✅ Document title updates  

---

## Next Steps

1. **Install dependencies** (if not done): `yarn install`
2. **Start dev server**: `yarn dev`
3. **Open browser**: http://localhost:3000
4. **Test the landing page** and navigate to `/timer`
5. **Try keyboard shortcuts**: Space (play/pause), R (reset), S (settings)

---

## PWA Setup (Optional)

To enable PWA support:

1. Install next-pwa:
   ```bash
   yarn add next-pwa
   ```

2. Uncomment PWA config in `next.config.ts`

3. Build and test:
   ```bash
   yarn build
   yarn start
   ```

---

## Google OAuth Setup (Coming Soon)

The Login button in the header is ready for Google OAuth integration.

To implement:

1. Install Supabase client
2. Set up Google OAuth in Supabase dashboard
3. Implement auth hook
4. Update header component

---

## Documentation

- **COMPONENTS.md** - Component API documentation
- **STATE_MANAGEMENT.md** - Zustand stores and hooks
- **IMPLEMENTATION_SUMMARY.md** - Complete feature overview
- **README.md** - Project overview

---

## Common Issues

### TypeScript Errors

If you see TypeScript errors, ensure all dependencies are installed:

```bash
yarn install
```

### Missing Dependencies

If modules are missing, check `package.json` and run:

```bash
yarn install
```

### Build Errors

Clear Next.js cache and rebuild:

```bash
rm -rf .next
yarn dev
```

---

## Support

For issues or questions, check the documentation files or review the implementation.

Enjoy building with BlackFocus! 🎯

