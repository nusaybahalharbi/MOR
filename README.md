# MOR / مر

Public marketing website for MOR, an Arabic-first curbside pickup experience for neighborhood stores.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm ci && npm run build
```

Optional environment variables:

- `VITE_CONTACT_EMAIL` (defaults to `hello@morapp.tech`)
- `VITE_MERCHANT_EMAIL` (defaults to `merchants@morapp.tech`)

The contact and merchant forms open a prepared email in the visitor's email application. Connect a form backend before launch if in-page submission is required.

## Vercel deployment

- Framework Preset: Vite
- Root Directory: repository root
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

`vercel.json` provides the SPA fallback needed for direct visits and refreshes on client-side routes such as `/merchants`, `/contact`, `/privacy`, and `/terms`.
