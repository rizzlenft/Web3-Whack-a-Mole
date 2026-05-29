/** Notify rizzle.io parent page (Arcade embed) after score events. */
export function notifyParentWhackScore(score: number, playerName?: string) {
  if (window.self === window.top) return;
  try {
    window.parent.postMessage(
      {
        type: 'whack-score',
        game: 'whack-a-mole',
        score,
        playerName: playerName?.trim() || undefined,
      },
      window.location.origin,
    );
  } catch {
    /* cross-origin or blocked */
  }
}
