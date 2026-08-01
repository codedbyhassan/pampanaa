export function PlayerHealthBar({ health, max = 100 }) {
  const pct = Math.max(0, Math.min(100, (health / max) * 100));
  return (
    <div className="sg-healthbar" role="img" aria-label={`Health ${Math.round(health)}`}>
      <div className="sg-healthbar__fill" data-low={pct < 35} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default PlayerHealthBar;
