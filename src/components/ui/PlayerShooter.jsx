import { useEffect, useRef } from 'react';
import { PLAYER, SKINS } from '../../utils/constants';
import { drawShip } from '../../canvas/spriteDrawer';

export function PlayerShooter({ shipDesign = 'interceptor', skin = 'default', color, size = 64 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw ship at center, pointing up
    const centerX = size / 2;
    const centerY = size / 2;
    const shipSize = size * 0.6;
    const shipColor = color || SKINS[skin] || SKINS.default;

    drawShip(ctx, centerX, centerY, shipSize, -Math.PI / 2, shipColor, {
      design: shipDesign,
      colorblind: false,
    });
  }, [shipDesign, skin, color, size]);

  return (
    <canvas
      ref={canvasRef}
      className="sg-player-shooter"
      style={{ width: size, height: size }}
      aria-label="Player ship"
    />
  );
}
