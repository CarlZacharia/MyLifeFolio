# Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd mylifefolio
npm install
```

### Step 2: Configure Environment
Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://zpbpdcwuwgkwmpfmgmyo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get your anon key from the Supabase dashboard: Settings > API > `anon` `public` key.

### Step 3: Set Up Database
In the Supabase SQL Editor:
1. Run `supabase/drop_all_tables.sql` to clear any existing tables
2. Run `supabase/mylifefolio_full_schema.sql` to create all tables and policies

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open in Browser
Navigate to http://localhost:5173

## Deploy to Cloudflare Pages

1. Push code to GitHub (`CarlZacharia/MyLifeFolio`)
2. In Cloudflare Pages dashboard, create a new project connected to the repo
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy

## Common Issues

**App won't start**
- Run `npm install` again
- Check `.env` has correct Supabase URL and anon key

**Auth not working**
- Verify Supabase anon key is correct
- Check that email confirmation is disabled in Supabase (for dev)

**Database errors**
- Re-run the schema SQL in Supabase SQL Editor
- Check RLS policies are in place

---

See README.md for full documentation.
