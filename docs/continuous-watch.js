export const WATCH_REPLAY_DELAY=6000;
// Derived from this match only: no stale timer can restart a different mode.
export function continuousWatchState(local,time=Date.now()){
 const enabled=local?.mode==='watch'&&local.continuousWatch===true;
 const finished=enabled&&local.game?.status==='finished'&&Number.isFinite(local.game.finishedAt);
 const remaining=finished?Math.max(0,Math.ceil((local.game.finishedAt+WATCH_REPLAY_DELAY-time)/1000)):null;
 return {enabled,remaining,ready:finished&&time>=local.game.finishedAt+WATCH_REPLAY_DELAY};
}
