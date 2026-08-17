# Web3 Whack-a-Mole

Play: [rizzle.io/games](https://rizzle.io/games)

A browser arcade game. Moles pop up wearing scammer profile pictures. You have 60 seconds to whack as many as you can. Speed ramps until it is nearly impossible. Scores go to a public leaderboard.

No wallet required to play.

## What this repo is

Game source for the Whack-a-Mole embed on [rizzle.io](https://rizzle.io). Edit here, then sync the built files into the rizzle.io site repo.

| | |
|---|---|
| Live embed | [rizzle.io/games](https://rizzle.io/games) |
| Site repo | [github.com/rizzlenft/rizzle](https://github.com/rizzlenft/rizzle) |
| Game source | `artifacts/whack-a-mole/src/` |

## Run locally

Needs Node 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

Owner-facing setup notes (Volta pins, leaderboard proxy, rizzle.io sync) are in [LOCAL.md](LOCAL.md).

## Stack

React, Vite, TypeScript, pnpm workspaces. Leaderboard on rizzle.io uses Supabase via a Cloudflare Pages function.
