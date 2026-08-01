import { useGame } from '../../contexts/GameContext';

export function AchievementToast() {
  const { toasts } = useGame();
  if (!toasts.length) return null;
  return (
    <div className="sg-toasts">
      {toasts.map((t) => (
        <div className="sg-toast" key={t.toastId}>
          <div className="sg-accent" style={{ fontSize: 12, letterSpacing: 2 }}>
            ACHIEVEMENT
          </div>
          <div style={{ fontSize: 14 }}>{t.name}</div>
          <div className="sg-muted">{t.description}</div>
        </div>
      ))}
    </div>
  );
}

export default AchievementToast;
