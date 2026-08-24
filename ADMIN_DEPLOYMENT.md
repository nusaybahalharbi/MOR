# MOR Admin deployment

The admin interface is part of the same Vite build and is available at `/admin`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_PHONE_E164` using the public project values and the approved E.164 admin number.
3. Run `npm run dev` and open the exact URL printed by Vite, followed by `/admin`.

Never add a service-role key to this project. Admin access is checked with the authenticated user session and `public.is_admin()`.

## Phone OTP and Twilio

The browser calls Supabase Phone Auth; it never talks to Twilio directly. In the Supabase dashboard, enable Phone authentication and configure the Twilio provider with the Twilio Account SID, Auth Token, and approved sender. Keep all Twilio credentials in Supabase only.

The user associated with `VITE_ADMIN_PHONE_E164` must already exist in Supabase Auth and have the admin role recognized by `public.is_admin()`. OTP requests use `shouldCreateUser: false`, so the login page cannot create an unapproved account. The phone shown in the UI is an identifier, not an authorization mechanism; database role checks and RLS remain authoritative.

## Vercel

Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_PHONE_E164` to the Vercel project for Production and Preview. The existing SPA rewrite serves `/admin` and its child routes.

For `admin.morapp.tech`, add the domain to the same Vercel project. Pointing the subdomain at the same deployment preserves `morapp.tech`; the application selects the admin UI by `/admin`. A dedicated subdomain-root experience can be added later with host-based middleware or a separate Vercel project without changing the backend.
