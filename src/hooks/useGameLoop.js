import { useCallback, useEffect, useRef } from 'react';

/**
 * Owns the requestAnimationFrame loop. Never triggers React re-renders.
 */
export function useGameLoop(tick) {
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const runningRef = useRef(false);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  const frame = useCallback((time) => {
    if (!runningRef.current) return;
    const dt = Math.min((time - lastRef.current) / 1000, 0.05);
    lastRef.current = time;
    if (dt > 0) tickRef.current(dt);
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  return { start, stop };
}

export default useGameLoop;
