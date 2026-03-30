import { Router, type IRouter } from "express";
import { db, leaderboardTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import {
  GetLeaderboardQueryParams,
  SubmitScoreBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard", async (req, res) => {
  const query = GetLeaderboardQueryParams.parse(req.query);
  const limit = query.limit ?? 10;

  const entries = await db
    .select()
    .from(leaderboardTable)
    .orderBy(desc(leaderboardTable.score))
    .limit(limit);

  res.json(
    entries.map((e) => ({
      id: e.id,
      playerName: e.playerName,
      score: e.score,
      createdAt: e.createdAt.toISOString(),
    }))
  );
});

router.post("/leaderboard", async (req, res) => {
  const body = SubmitScoreBody.parse(req.body);

  const [entry] = await db
    .insert(leaderboardTable)
    .values({
      playerName: body.playerName,
      score: body.score,
    })
    .returning();

  res.status(201).json({
    id: entry.id,
    playerName: entry.playerName,
    score: entry.score,
    createdAt: entry.createdAt.toISOString(),
  });
});

export default router;
