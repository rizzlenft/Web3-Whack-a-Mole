# Local development (no Replit required)

This repo is yours on GitHub. Edit the game in Cursor, commit, push — Replit is optional.

## Prerequisites

- **Node.js 20+** (Volta: `volta install node@22` — repo pins 22.22.3)
- **pnpm** — `npm install -g pnpm`

## First-time setup

```bash
cd ~/Projects/Web3-Whack-a-Mole
volta install node@22    # once — repo pins 22.22.3
volta install pnpm@10    # once
pnpm install
```

Use Volta’s pnpm (`~/.volta/bin/pnpm`) or run from this directory so Node 20+ is picked up automatically.

## Run the game locally

```bash
pnpm dev
```

Open **http://localhost:5173**

Game source lives in `artifacts/whack-a-mole/src/`.

## Leaderboard during local dev

The game calls `GET/POST /api/leaderboard`. Options:

1. **Proxy to production** (after rizzle.io deploy):

   ```bash
   LEADERBOARD_PROXY_URL=https://rizzle.io pnpm dev
   ```

2. **Run the full Replit stack** (needs Postgres + `artifacts/api-server`) — only needed if you want a local DB.

On **rizzle.io**, the leaderboard uses Supabase via a Cloudflare Pages function — not Replit Postgres.

### Deploy to rizzle.io

From the **rizzle** repo (sibling folder):

```bash
cd ~/Projects/rizzle
npm run sync:whack-a-mole   # build + copy static files
git add public/games/whack-a-mole && git commit && git push
```

See `rizzle/public/games/README.md` for the full workflow.

## Build for rizzle.io embed

```bash
pnpm build:game:rizzle
```

Output: `artifacts/whack-a-mole/dist/public/` — copy into the rizzle repo at `public/games/whack-a-mole/`.

## Key paths

| Path | Purpose |
|------|---------|
| `artifacts/whack-a-mole/src/hooks/use-game-engine.ts` | Game logic, timing, score |
| `artifacts/whack-a-mole/src/pages/GameScreen.tsx` | Gameplay UI |
| `artifacts/whack-a-mole/src/pages/GameOverScreen.tsx` | Score submit |
| `artifacts/whack-a-mole/src/pages/Leaderboard.tsx` | Hall of Shame |
| `artifacts/whack-a-mole/vite.config.ts` | Vite base path, dev server |

## Git workflow

```bash
git add -A
git commit -m "Your change"
git push origin main
```

You do **not** need to republish on Replit unless you still want the old `replit.app` URL updated.
