import { useEffect, useRef } from 'react';
import { DEFAULT_KEYMAP } from '../utils/constants';

/**
 * Tracks pressed keys in a ref (never React state) and maps them to a
 * source-agnostic input vector via the configurable keymap.
 */
export function useKeyboard(keymap = DEFAULT_KEYMAP, { onKeyDown } = {}) {
  const keys = useRef({});
  const mapRef = useRef(keymap);
  mapRef.current = { ...DEFAULT_KEYMAP, ...keymap };
  const handlerRef = useRef(onKeyDown);
  handlerRef.current = onKeyDown;

  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
      handlerRef.current?.(e.code);
    };
    const up = (e) => {
      keys.current[e.code] = false;
    };
    const blur = () => {
      keys.current = {};
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  const read = () => {
    const k = keys.current;
    const m = mapRef.current;
    let x = 0;
    let y = 0;
    if (k[m.left] || k.ArrowLeft) x -= 1;
    if (k[m.right] || k.ArrowRight) x += 1;
    if (k[m.up] || k.ArrowUp) y -= 1;
    if (k[m.down] || k.ArrowDown) y += 1;
    return { x, y, firing: !!k[m.fire] };
  };

  return { read, keys };
}

export default useKeyboard;
