import { useEffect } from 'react';

export function RuntimeNotice({ notice, onClear }) {
  useEffect(() => {
    if (!notice) return undefined;
    const id = window.setTimeout(onClear, notice.duration ?? 2400);
    return () => window.clearTimeout(id);
  }, [notice, onClear]);

  if (!notice) return null;

  return (
    <div className="sg-overlay" style={{ pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 72 }}>
      <div className="sg-panel" style={{ maxWidth: 420, padding: '10px 14px', opacity: 0.94 }}>
        <div className="sg-label">{notice.title}</div>
        <div style={{ marginTop: 3, lineHeight: 1.45 }}>{notice.message}</div>
      </div>
    </div>
  );
}

export default RuntimeNotice;
