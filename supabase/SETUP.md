# Connecting Naaz AI CRM to Supabase

Follow these steps once. After that, I'll wire the app's data + login to it.

## 1. Create a project
1. Go to **https://supabase.com** → sign in → **New project**.
2. Name it `naaz-ai-crm`, pick a strong DB password (save it), choose the region
   closest to you, and create it. Wait ~2 minutes for it to provision.

## 2. Create the tables
1. In the project, open **SQL Editor** → **New query**.
2. Paste the entire contents of [`schema.sql`](./schema.sql) and click **Run**.
3. You should see "Success. No rows returned." — the tables + security are set up.

## 3. Get your API keys
1. Open **Project Settings** (gear icon) → **API**.
2. Copy these two values:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## 4. Add them to Vercel
1. In Vercel → your project → **Settings** → **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
2. (For local dev, also copy `.env.local.example` → `.env.local` with the same values.)

## 5. Enable email login
1. **Authentication** → **Providers** → make sure **Email** is enabled.
2. (Optional) For quick testing, **Authentication → Providers → Email** → turn
   **Confirm email** off so new signups can log in immediately.

## 6. Tell me
Paste your **Project URL** and **anon public key** back to me (both are safe to
share — they're protected by Row-Level Security). I'll then add the login screen
and switch every module from local demo data to your live Supabase database.
