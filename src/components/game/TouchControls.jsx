import { useRef, useState } from 'react';

const RADIUS = 60;
const NUB = 24;

export function TouchControls({ onMove, onFire }) {
  const baseRef = useRef(null);
  const [nub, setNub] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const touch = e.touches[0];
    if (!touch || !baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    let dx = touch.clientX - (rect.left + rect.width / 2);
    let dy = touch.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    const max = RADIUS - NUB / 2;
    if (dist > max) {
      dx = (dx / dist) * max;
      dy = (dy / dist) * max;
    }
    setNub({ x: dx, y: dy });
    onMove(dx / max, dy / max);
  };

  const handleEnd = () => {
    setNub({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div className="sg-touch">
      <div
        ref={baseRef}
        className="sg-joystick"
        onTouchStart={handleMove}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
      >
        <div
          className="sg-joystick__nub"
          style={{ transform: `translate(${nub.x}px, ${nub.y}px)` }}
        />
      </div>
      <button
        type="button"
        className="sg-firebtn"
        onTouchStart={(e) => {
          e.preventDefault();
          onFire(true);
        }}
        onTouchEnd={() => onFire(false)}
        onTouchCancel={() => onFire(false)}
      >
        FIRE
      </button>
    </div>
  );
}

export default TouchControls;
