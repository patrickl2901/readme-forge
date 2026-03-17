# Ziel
Nutzer geben eine öffentliche GitHub-Repo-URL ein → in <10 Sekunden entsteht ein professioneller, schöner README.md mit Badges, Tech-Stack, Installation, Usage, Contributing usw.
Speichern + Versionieren der Generierungen für später.

# Kern-Features (MVP)

1. Repo-URL-Eingabe + optional eigener GitHub-PAT (für höhere Rate-Limits)
2. Automatische Erkennung:
  - Repo-Metadaten (Name, Description, Stars, License)
  - Tech-Stack aus package.json / requirements.txt / Cargo.toml etc.
  - Haupt-Sprachen + Dateistruktur
3. AI-generierter README (mit Vercel AI SDK + Google Gemini 1.5 Flash – komplett kostenlos)
4. Live-Markdown-Preview (mit Tailwind-Styling + Dark-Mode)
5. One-Click: Copy Markdown | Download .md | „Copy GitHub-Ready“
6. Persönliche History (letzte 20 Generierungen)
7. 5+ vordefinierte Templates (Minimal, Modern, Notion-Style, Project-Showcase, Library)
8. Fake-Pro-Buttons (Custom Template, Auto-Update via Webhook – nur UI)

# Nicht-MVP (später): Private Repos, Auto-Push zum Repo, Team-Sharing.

## User Flow

- Landing → „Try it free“ (kein Login nötig für erste Generierung)
- Nach 1. Generierung → Supabase Auth (Magic Link oder Google)
- Dashboard: Meine Readmes + New Generate
- Generator-Seite: URL-Feld → Generate-Button → Lade-Spinner → Split-View (Preview + Raw Markdown)

# Tech-Stack (alles 100 % kostenlos)

- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + sonner (Toasts)
- AI: Vercel AI SDK (ai) + Google Gemini 1.5 Flash (kostenloser API-Key über https://aistudio.google.com)
- DB/Auth: Supabase (Free-Tier)
- Markdown: react-markdown + remark-gfm + rehype-raw
- Icons: Lucide React
- Deploy: Vercel (Hobby)
- Optional: zod für Validation, date-fns

# Supabase Datenmodell (kopierbar)

```sql
-- Profiles (automatisch via Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users,
  github_username text,
  created_at timestamp default now()
);

-- Generated Readmes
create table public.readmes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  repo_url text not null,
  repo_name text,
  generated_markdown text not null,
  template text default 'modern',
  metadata jsonb, -- { stars, languages, tech_stack }
  created_at timestamp default now()
);

-- RLS Policies (einfach)
alter table readmes enable row level security;
create policy "Users can only see own readmes" on readmes
  for all using (auth.uid() = user_id);

```
## AI-Prompt (Beispiel – wird im Server Action verwendet)
Du kannst den Prompt später feintunen – Gemini ist extrem gut darin.

# Umsetzungsplan (Solo, realistisch 4–6 Wochen)

## Phase 1: Setup & Grundgerüst (1–2 Tage)

- npx create-next-app@latest readme-forge --typescript --tailwind --eslint --app --yes
- shadcn/ui installieren + Components: Button, Input, Card, Tabs, Markdown-Preview
- Supabase Projekt anlegen + Env-Variablen (SUPABASE_URL, SUPABASE_ANON_KEY)
- Vercel AI SDK + @ai-sdk/google installieren

## Phase 2: Auth + DB (2–3 Tage)

- Supabase Auth (Magic Link + Google)
- Tabellen + RLS wie oben anlegen
- Profile-Hook mit useSupabaseClient

## Phase 3: GitHub Fetch + Parsing (3–4 Tage)

- Server Action generateReadmeAction:
  1. URL validieren
  2. Fetch GitHub REST API (/repos/{owner}/{repo} + /contents + /languages)
  3. package.json (falls vorhanden) parsen → Tech-Stack-Array
  4. Alles in ein strukturiertes Objekt packen
- Rate-Limit-Hinweis: „Für mehr als 60 Calls/Stunde eigenen PAT eingeben“ (optionales Feld)

## Phase 4: AI-Generierung (2–3 Tage)

- Im Server Action:

```TypeScript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const { text } = await generateText({
  model: google('gemini-1.5-flash'),
  prompt: `Du bist ein erfahrener README-Experte. Erstelle einen professionellen README.md basierend auf diesen Repo-Daten: ${JSON.stringify(repoData)}. Verwende folgendes Template: ${selectedTemplate}...`
});

```
```
```
- Markdown in DB speichern + zurückgeben

## Phase 5: UI + Live-Preview (3–4 Tage)

- Generator-Page mit Split-View (Left: Form + Settings | Right: Preview)
- Copy-Buttons mit navigator.clipboard
- History-Liste mit Cards + „Regenerate“-Button

## Phase 6: Polish + Extras (2 Tage)

- Dark/Light Mode (next-themes)
- Loading States + Error Handling
- SEO (Meta-Tags + OG-Image mit Vercel OG)
- README der App selbst mit ReadmeForge generieren 😎

## Phase 7: Deploy & Portfolio-Optimierung (1 Tag)

- Vercel Connect → live in 2 Minuten
- Domain: readme-forge.vercel.app
- GitHub-Repo mit:
  - Live-Demo-Link
  - Tech-Stack-Badges
  - „Built with ReadmeForge“


# Gesamte Zeit: 2–3 Wochen intensiv oder 5–6 Wochen nebenbei.
# Kosten: 0 € (Gemini Free-Tier reicht für hunderte Generierungen im Monat).
# Bonus für Bewerbungen

- Zeige im README: „AI powered by Gemini 1.5 Flash (free tier)“
- Screenshots: Split-View, Before/After, History
- „Tech Decisions“-Abschnitt: Warum Server Actions statt API-Route, RLS, etc.
