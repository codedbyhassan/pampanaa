import { THREAT_PRESENTATIONS } from '../../domain/world/threatPresentation';

export function drawThreat(ctx, x, y, radius, threatId, time = 0, state = {}) {
  const presentation = THREAT_PRESENTATIONS[threatId];
  if (!presentation) return;
  const pulse = 1 + Math.sin(time * 4 + x * 0.01) * 0.06;
  const r = radius * pulse;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = state.active === false ? 0.35 : 1;
  ctx.lineWidth = presentation.boss ? 3 : 2;
  ctx.strokeStyle = presentation.boss ? '#f8fafc' : '#cbd5e1';
  ctx.fillStyle = presentation.boss ? '#334155' : '#1e293b';
  if (presentation.classId === 'swarm') {
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.lineTo(r * 0.85, r * 0.55); ctx.lineTo(0, r * 0.8); ctx.lineTo(-r * 0.85, r * 0.55); ctx.closePath();
  } else if (presentation.classId === 'controller') {
    ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.arc(0, 0, r, 0, Math.PI * 2);
  } else if (presentation.classId === 'colossus') {
    ctx.beginPath(); ctx.rect(-r * 0.72, -r, r * 1.44, r * 2); ctx.moveTo(-r * 1.1, -r * 0.35); ctx.lineTo(r * 1.1, -r * 0.35); ctx.moveTo(-r * 1.1, r * 0.35); ctx.lineTo(r * 1.1, r * 0.35);
  } else {
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
  }
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fillStyle = '#94a3b8'; ctx.fill();
  ctx.restore();
}

export function drawBossHealthBar(ctx, x, y, width, state = {}) {
  const ratio = Math.max(0, Math.min(1, (state.health ?? 0) / Math.max(1, state.maxHealth ?? 1)));
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(x, y, width, 8);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 2, y + 2, (width - 4) * ratio, 4);
  ctx.restore();
}
