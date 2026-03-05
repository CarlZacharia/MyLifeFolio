# MyLifeFolio

A professional estate planning application built with React, TypeScript, Material-UI, and Supabase. Hosted on Cloudflare Pages.

## Features

- Multi-section estate planning questionnaire
- User authentication (email/password and Google OAuth) via Supabase Auth
- Profile management with questions for consultation
- Education Center with videos and FAQs
- Planning Pathfinder (Trust quiz, IRA RMD calculator)
- Trust Plan report generation (DOCX export)
- Admin dashboard for managing intakes
- Responsive Material-UI design

## Tech Stack

- **Frontend:** React 18, TypeScript, Material-UI (MUI v5)
- **Build:** Vite
- **Backend:** Supabase (Auth, Database, Storage)
- **Hosting:** Cloudflare Pages
- **Repository:** https://github.com/CarlZacharia/MyLifeFolio

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project (zpbpdcwuwgkwmpfmgmyo.supabase.co)

### Installation

```bash
cd mylifefolio
npm install
```

### Configure Environment

Create/edit `.env`:
```env
VITE_SUPABASE_URL=https://zpbpdcwuwgkwmpfmgmyo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build
```

Output goes to `dist/` directory.

## Deployment (Cloudflare Pages)

1. Connect the `CarlZacharia/MyLifeFolio` GitHub repo in Cloudflare Pages dashboard
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
mylifefolio/
├── app/
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main questionnaire with stepper
├── components/
│   ├── LandingPage.tsx         # Landing/home page
│   ├── MyLifeFolioHome.tsx     # MyLifeFolio home overview
│   ├── Login.tsx               # Login form
│   ├── Register.tsx            # Registration form
│   ├── Profile.tsx             # User profile & questions
│   ├── AdminDashboard.tsx      # Admin panel
│   ├── EducationCenter.tsx     # Educational content
│   ├── PlanningPathfinder.tsx  # Interactive planning tools
│   ├── HelpModal.tsx           # Help dialog
│   ├── ClientNotesModal.tsx    # Client notes
│   └── TrustPlan/              # Trust plan report generation
├── lib/
│   ├── AuthContext.tsx         # Auth state management
│   ├── FormContext.tsx         # Form data management
│   ├── supabaseClient.ts      # Supabase browser client
│   ├── supabaseIntake.ts      # Intake CRUD operations
│   └── supabaseOfficesAttorneys.ts  # Office/attorney queries
├── supabase/
│   ├── mylifefolio_full_schema.sql  # Full database schema
│   └── drop_all_tables.sql          # Schema cleanup script
├── public/                     # Static assets
├── .env                        # Environment variables (gitignored)
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Database Setup

1. Run `supabase/drop_all_tables.sql` in the Supabase SQL Editor to clear existing tables
2. Run `supabase/mylifefolio_full_schema.sql` to create all tables, RLS policies, triggers, and seed data

## Support

- Email: info@mylifefolio.com

## License

Proprietary - MyLifeFolio
