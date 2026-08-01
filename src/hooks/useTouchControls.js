import { useEffect, useRef, useState } from 'react';

export function useTouchControls(enabled) {
  const stateRef = useRef({ x: 0, y: 0, firing: false });
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }, []);

  const setMove = (x, y) => {
    stateRef.current.x = x;
    stateRef.current.y = y;
  };
  const setFiring = (firing) => {
    stateRef.current.firing = firing;
  };
  const read = () => (enabled ? { ...stateRef.current } : { x: 0, y: 0, firing: false });

  return { supported, read, setMove, setFiring };
}

export default useTouchControls;
