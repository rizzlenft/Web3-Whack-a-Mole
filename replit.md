# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Web3 Whack-a-Mole browser game with global leaderboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, framer-motion, canvas-confetti

## Application: Web3 Whack-a-Mole

A browser-based arcade whack-a-mole game where moles display scammer PFPs. Players have 60 seconds to whack as many moles as possible. Mole speed progressively increases from slow to nearly impossible by the end. Global leaderboard backed by PostgreSQL.

### Game Mechanics
- 8 mole holes in a grid
- Moles pop up randomly with scammer PFP images on their heads
- Moles have different PFPs each time (random from pool)
- 60-second timer
- Speed escalates linearly throughout the game
- Click/tap to whack; satisfying REKT! animation on hit
- Score saved to global leaderboard at game end

### PFP Images
- Placeholder: `/public/placeholder-pfp.png`
- Future: Users can upload additional PFP images that get randomly assigned to moles

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── whack-a-mole/       # React+Vite frontend game (served at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Routes

- `GET /api/healthz` — Health check
- `GET /api/leaderboard?limit=10` — Get top scores
- `POST /api/leaderboard` — Submit score `{ playerName, score }`

## Database Schema

- `leaderboard` — `id, player_name, score, created_at`

## Key Files

- `artifacts/whack-a-mole/src/hooks/use-game-engine.ts` — Core game logic (mole timing, score, state)
- `artifacts/whack-a-mole/src/components/MoleHole.tsx` — Mole hole with PFP and animations
- `artifacts/whack-a-mole/src/pages/GameScreen.tsx` — Active gameplay UI
- `artifacts/whack-a-mole/src/pages/GameOverScreen.tsx` — Score submission
- `artifacts/whack-a-mole/src/pages/Leaderboard.tsx` — Top 10 scores
- `artifacts/api-server/src/routes/leaderboard.ts` — Leaderboard CRUD routes
- `lib/db/src/schema/leaderboard.ts` — DB table definition
