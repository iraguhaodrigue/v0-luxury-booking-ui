# KILUVA Setup Guide

## Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Supabase account (free tier available)
- Git for version control

## Quick Start (5 Minutes)

### 1. Clone & Install

```bash
git clone <repository-url>
cd v0-project
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy template
cp .env.example .env.local

# Fill in required values:
# - NEXT_PUBLIC_SUPABASE_URL (from supabase.com)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (from supabase.com)
# - SUPABASE_SERVICE_ROLE_KEY (from supabase.com)
```

### 3. Start Development Server

```bash
npm run dev
# Open http://localhost:3000
```

## Complete Setup with Database

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for project to initialize (~2 minutes)
4. Go to Settings → API
5. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Configure Environment

```bash
# Update .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 3: Run Database Migrations

```bash
# Connect Supabase CLI
supabase link --project-ref <your-project-ref>

# Run migrations
supabase migration up
```

The migrations will create all required tables:
- Users (with roles)
- Properties & Rooms
- Bookings & Payments
- Messages & Conversations
- Reviews & Notifications
- Products & Shops

### Step 4: Start Development

```bash
npm run dev
```

Visit http://localhost:3000

## Build & Deployment

### Build Locally

```bash
npm run build
# Check for errors - should show "✓ Compiled successfully"
```

### Deploy to Vercel

```bash
# Push to GitHub first
git push origin main

# Connect to Vercel dashboard
# - Import repository
# - Add environment variables
# - Deploy automatically
```

### Deploy to Other Platforms

1. Build the app: `npm run build`
2. Set environment variables on your platform
3. Run start command: `npm run start`

## Common Issues & Solutions

### Build Error: "useSearchParams is not available"

**Solution**: Already fixed in v1.0! The component now uses Suspense boundary.

### Build Error: "Supabase environment variables missing"

**Solution**: Make sure `.env.local` exists and has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Development Server Won't Start

**Solution**: Clear cache and reinstall:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Database Connection Error

**Solution**: 
1. Verify Supabase project is active
2. Check environment variables are correct
3. Run `supabase link --project-ref <your-ref>` again

## Test Accounts

After setting up, create accounts with these roles:

| Role | Email | Use Case |
|------|-------|----------|
| Admin | admin@kiluva.com | `/admin/dashboard` |
| Owner | owner@kiluva.com | `/owner/dashboard` |
| Buyer | buyer@kiluva.com | `/dashboard` |

## Project Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types

# Database
supabase migration up    # Run migrations
supabase migration new   # Create new migration
```

## File Structure

```
v0-project/
├── app/                 # Next.js pages & API routes
├── components/          # React components
├── lib/
│   ├── services/       # Business logic
│   ├── supabase/       # Supabase config
│   └── utils/          # Utilities
├── public/             # Static assets
├── supabase/
│   └── migrations/     # Database migrations
├── .env.example        # Environment template
└── proxy.ts            # Next.js routing middleware
```

## Features Overview

### Public Pages
- `/` - Homepage with featured properties
- `/search` - Advanced property search
- `/browse` - Browse all properties
- `/properties/[id]` - Property details

### Buyer Dashboard
- `/dashboard` - Bookings and profile
- `/booking` - Multi-step booking flow
- `/messages` - Direct messaging

### Owner Dashboard
- `/owner/dashboard` - Overview and statistics
- `/owner/properties` - Manage listings
- `/owner/bookings` - View bookings

### Admin Dashboard
- `/admin/dashboard` - Platform stats
- `/admin/bookings` - All bookings
- `/admin/users` - User management

### Marketplace
- `/shop` - Product marketplace
- `/messages` - Conversations

## Troubleshooting

### Need Help?

1. Check the [README.md](./README.md) for feature documentation
2. Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
3. Review inline code comments in files
4. Check GitHub issues for similar problems

### Report Issues

Create detailed bug reports with:
- What you were doing
- What error appeared
- Steps to reproduce
- Your environment (Node version, OS, etc.)

## Next Steps

1. ✅ Complete setup (you're here!)
2. Create test accounts for different roles
3. Explore the admin dashboard
4. Configure payment processing (DPO Group)
5. Customize branding and settings in `kiluva.config.ts`
6. Deploy to production

---

**Happy Building!** 🚀
