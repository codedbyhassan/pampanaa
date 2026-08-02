import { useCallback, useEffect, useRef } from 'react';
import setupCanvas from '../../canvas/setupCanvas';
import GameEngine from '../../canvas/GameEngine';
import { WORLD } from '../../utils/constants';
import { WEAPON_ORDER } from '../weapons/weaponTypes';
import { useGame } from '../../contexts/GameContext';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGamepad } from '../../hooks/useGamepad';

export function GameCanvas({
  mode,
  startWave = 1,
  resumeSnapshot,
  paused,
  scheme,
  touch,
  engineRef,
  onEngineEvent,
  onTogglePause,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const aimRef = useRef(null);
  const mouseDownRef = useRef(false);
  const { settings, progress, syncFromEngine } = useGame();
  const gamepad = useGamepad();

  const handleKeyDown = useCallback(
    (code) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (code === 'Escape') {
        onTogglePause();
        return;
      }
      if (code === 'KeyQ') return engine.cycleWeapon(-1);
      if (code === 'KeyE') return engine.cycleWeapon(1);
      const index = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].indexOf(code);
      if (index >= 0) engine.selectWeapon(WEAPON_ORDER[index]);
    },
    [engineRef, onTogglePause],
  );

  const keyboard = useKeyboard(settings.keymap, { onKeyDown: handleKeyDown });

  const tick = useCallback(
    (dt) => {
      const engine = engineRef.current;
      const ctx = ctxRef.current;
      if (!engine || !ctx) return;

      const pad = gamepad.read();
      let input;
      if (pad.activeThisFrame && scheme !== 'touch' && scheme !== 'keyboard') {
        input = { x: pad.x, y: pad.y, firing: pad.firing };
      } else if (scheme === 'touch') {
        input = touch.read();
      } else {
        const kb = keyboard.read();
        const t = touch.read();
        input = {
          x: kb.x || t.x,
          y: kb.y || t.y,
          firing: kb.firing || t.firing || mouseDownRef.current,
        };
      }
      input.aim = aimRef.current;
      engine.setInput(input);

      engine.update(dt);
      engine.draw(ctx, dt);
    },
    [engineRef, gamepad, keyboard, scheme, touch],
  );

  const { start, stop } = useGameLoop(tick);

  // Create the engine once per mount.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    ctxRef.current = setupCanvas(canvas);

    const engine = new GameEngine({
      settings,
      progress,
      mode,
      startWave,
      callbacks: { onSync: syncFromEngine, onEvent: onEngineEvent },
    });
    engineRef.current = engine;
    engine.handleResize();
    if (resumeSnapshot) engine.restore(resumeSnapshot);
    syncFromEngine({
      status: 'playing',
      score: engine.score,
      health: engine.player.health,
      wave: engine.wave,
      weapon: engine.currentWeaponKey,
      unlockedWeapons: [...engine.unlockedWeapons],
    });
    engine.draw(ctxRef.current, 0);

    return () => {
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the arena locked to the viewport without ever overflowing it.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      ctxRef.current = setupCanvas(canvas);
      engineRef.current?.handleResize();
      if (ctxRef.current) engineRef.current?.draw(ctxRef.current, 0);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [engineRef]);

  // Scroll wheel cycles weapons. React's onWheel is passive, so bind natively.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cooldown = 0;
    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - cooldown < 120) return;
      cooldown = now;
      engineRef.current?.cycleWeapon(e.deltaY > 0 ? 1 : -1);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [engineRef]);

  useEffect(() => {
    if (paused) stop();
    else start();
    return stop;
  }, [paused, start, stop]);

  const toWorld = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WORLD.width,
      y: ((e.clientY - rect.top) / rect.height) * WORLD.height,
    };
  };

  return (
    <canvas
      ref={canvasRef}
      className="sg-canvas"
      onMouseMove={(e) => {
        aimRef.current = toWorld(e);
      }}
      onMouseDown={(e) => {
        aimRef.current = toWorld(e);
        mouseDownRef.current = true;
      }}
      onMouseUp={() => {
        mouseDownRef.current = false;
      }}
      onMouseLeave={() => {
        mouseDownRef.current = false;
      }}
      aria-label="Game area"
    />
  );
}

export default GameCanvas;
