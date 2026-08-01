import { useEffect, useState } from 'react';

const DEADZONE = 0.22;

export function useGamepad() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const on = () => setConnected(true);
    const off = () => setConnected(false);
    window.addEventListener('gamepadconnected', on);
    window.addEventListener('gamepaddisconnected', off);
    return () => {
      window.removeEventListener('gamepadconnected', on);
      window.removeEventListener('gamepaddisconnected', off);
    };
  }, []);

  /** Cheap per-frame read — navigator.getGamepads() is a snapshot, not a subscription. */
  const read = () => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return { x: 0, y: 0, firing: false, activeThisFrame: false };
    }
    const pads = navigator.getGamepads();
    for (const pad of pads) {
      if (!pad) continue;
      let x = pad.axes[0] || 0;
      let y = pad.axes[1] || 0;
      if (Math.abs(x) < DEADZONE) x = 0;
      if (Math.abs(y) < DEADZONE) y = 0;
      const firing = !!(pad.buttons[0]?.pressed || pad.buttons[7]?.pressed);
      return { x, y, firing, activeThisFrame: x !== 0 || y !== 0 || firing };
    }
    return { x: 0, y: 0, firing: false, activeThisFrame: false };
  };

  return { connected, read };
}

export default useGamepad;
