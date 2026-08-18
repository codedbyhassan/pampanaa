import { useCallback, useEffect, useRef } from 'react';
import setupCanvas from '../../canvas/setupCanvas';
import { WORLD } from '../../utils/constants';
import { WEAPON_ORDER } from '../weapons/weaponTypes';
import { useGame } from '../../contexts/GameContext';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGamepad } from '../../hooks/useGamepad';
import GameRuntime from '../../runtime/GameRuntime';

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
  const runtimeRef = useRef(null);
  const aimRef = useRef(null);
  const mouseDownRef = useRef(false);
  const inputProviderRef = useRef(() => ({ x: 0, y: 0, firing: false, aim: null }));
  const syncRef = useRef(null);
  const eventRef = useRef(onEngineEvent);
  const { settings, progress, syncFromEngine } = useGame();
  const gamepad = useGamepad();

  eventRef.current = onEngineEvent;
  syncRef.current = syncFromEngine;

  const handleKeyDown = useCallback(
    (code) => {
      const runtime = runtimeRef.current;
      if (!runtime) return;
      if (code === 'Escape') {
        onTogglePause();
        return;
      }
      if (code === 'KeyQ') return runtime.cycleWeapon(-1);
      if (code === 'KeyE') return runtime.cycleWeapon(1);
      const index = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'].indexOf(code);
      if (index >= 0) runtime.selectWeapon(WEAPON_ORDER[index]);
    },
    [onTogglePause],
  );

  const keyboard = useKeyboard(settings.keymap, { onKeyDown: handleKeyDown });

  inputProviderRef.current = () => {
    const pad = gamepad.read();
    let input;
    if (pad.activeThisFrame && scheme !== 'touch' && scheme !== 'keyboard') {
      input = { x: pad.x, y: pad.y, firing: pad.firing };
    } else if (scheme === 'touch') {
      input = touch.read();
    } else {
      const kb = keyboard.read();
      const t = touch.read();
      if (kb.x || kb.y) aimRef.current = null;
      input = {
        x: kb.x || t.x,
        y: kb.y || t.y,
        firing: kb.firing || t.firing || mouseDownRef.current,
      };
    }
    return { ...input, aim: aimRef.current };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    ctxRef.current = setupCanvas(canvas);

    const runtime = new GameRuntime({
      canvasContext: ctxRef.current,
      settings,
      progress,
      mode,
      startWave,
      resumeSnapshot,
      getInput: () => inputProviderRef.current(),
      onSync: (patch) => syncRef.current?.(patch),
      onEvent: (name, payload) => eventRef.current?.(name, payload),
    });

    runtimeRef.current = runtime;
    engineRef.current = runtime;
    runtime.resize();
    runtime.draw();
    syncRef.current?.({
      status: 'playing',
      score: runtime.score,
      health: runtime.player.health,
      wave: runtime.wave,
      weapon: runtime.currentWeaponKey,
      amps: { ...runtime.player.amps },
      unlockedWeapons: [...runtime.unlockedWeapons],
    });

    return () => {
      runtime.stop();
      runtime.events.clear();
      runtimeRef.current = null;
      engineRef.current = null;
    };
    // Runtime is intentionally created once per mounted game session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      ctxRef.current = setupCanvas(canvas);
      const runtime = runtimeRef.current;
      runtime?.setContext(ctxRef.current);
      runtime?.resize();
      runtime?.draw();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cooldown = 0;
    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - cooldown < 120) return;
      cooldown = now;
      runtimeRef.current?.cycleWeapon(e.deltaY > 0 ? 1 : -1);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return undefined;
    if (paused) runtime.pause();
    else runtime.resume();
    return () => runtime.pause();
  }, [paused]);

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
