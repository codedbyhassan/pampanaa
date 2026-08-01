export function PauseMenu({ onResume, onSaveQuit, onQuit }) {
  return (
    <div className="sg-modal">
      <div className="sg-modal__inner sg-stack">
        <h2 className="sg-h2">Paused</h2>
        <button className="sg-btn sg-btn--primary" onClick={onResume}>
          Resume
        </button>
        <button className="sg-btn" onClick={onSaveQuit}>
          Save &amp; Quit
        </button>
        <button className="sg-btn sg-btn--danger" onClick={onQuit}>
          Quit to Menu
        </button>
      </div>
    </div>
  );
}

export default PauseMenu;
