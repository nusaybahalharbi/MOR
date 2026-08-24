# MOR Admin deployment

The admin interface is part of the same Vite build and is available at `/admin`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the public project values.
3. Run `npm run dev` and open the exact URL printed by Vite, followed by `/admin`.

Never add a service-role key to this project. Admin access is checked with the authenticated user session and `public.is_admin()`.

## Vercel

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project for Production and Preview. The existing SPA rewrite serves `/admin` and its child routes.

For `admin.morapp.tech`, add the domain to the same Vercel project. Pointing the subdomain at the same deployment preserves `morapp.tech`; the application selects the admin UI by `/admin`. A dedicated subdomain-root experience can be added later with host-based middleware or a separate Vercel project without changing the backend.
