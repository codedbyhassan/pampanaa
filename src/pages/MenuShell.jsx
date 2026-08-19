import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { PlayerShooter } from '../components/ui/PlayerShooter';
import soundManager from '../components/audio/SoundManager';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import Achievements from './Achievements';
import Stats from './Stats';
import Credits from './Credits';
import Presets from './Presets';
import Campaign from './Campaign';
import Missions from './Missions';
import Codex from './Codex';
import { FRONTEND_NAVIGATION, FRONTEND_ROUTES } from '../application/ui/navigationModel';

export function MenuShell({ onStart, onContinue }) {
  const { progress, hasSave, profile, signOut, unlockedAchievements, settings } = useGame();
  const { resumeAudio } = useAudio();
  const [section, setSection] = useState(FRONTEND_ROUTES.HOME);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    soundManager.init();
    soundManager.setIntensity(0.25);
    soundManager.startMusic('ocean');
    return () => soundManager.stopMusic();
  }, []);

  const begin = (mode, missionId = null) => {
    resumeAudio();
    onStart(mode, missionId);
  };

  const resume = async () => {
    if (!hasSave || busy) return;
    setBusy(true);
    setSection('presets');
    setBusy(false);
  };

  const select = (id) => setSection(id);
  const goHome = () => setSection(FRONTEND_ROUTES.HOME);

  const renderSection = () => {
    switch (section) {
      case FRONTEND_ROUTES.CAMPAIGN:
        return <Campaign onBack={goHome} onStartMission={(id) => begin('campaign', id)} />;
      case FRONTEND_ROUTES.MISSIONS:
        return <Missions onBack={goHome} onStartMission={(id) => begin('campaign', id)} />;
      case FRONTEND_ROUTES.CODEX:
        return <Codex onBack={goHome} />;
      case FRONTEND_ROUTES.ACHIEVEMENTS:
        return <Achievements onBack={goHome} />;
      case FRONTEND_ROUTES.CAREER:
        return <Stats onBack={goHome} />;
      case FRONTEND_ROUTES.LEADERBOARD:
        return <Leaderboard onBack={goHome} />;
      case FRONTEND_ROUTES.SETTINGS:
        return <Settings onBack={goHome} />;
      case FRONTEND_ROUTES.CREDITS:
        return <Credits onBack={goHome} />;
      case 'presets':
        return <Presets onContinue={onContinue} onClose={goHome} />;
      default:
        return (
          <section className="sg-hero">
            <img src="./logo.png" alt="Pampanaa" className="sg-hero__logo" />
            <div className="sg-label">The Silence</div>
            <h1 className="sg-h2">Something answered the perimeter.</h1>
            <p className="sg-hero__tag">
              Pampanaa survived the Silence. Tonight, the last settlement receives a signal from beyond the dead zones.
            </p>
            <div className="sg-hero__stats">
              <div><b>{progress.highestWaveReached || 0}</b><span>Highest encounter</span></div>
              <div><b>{progress.totalEnemiesDefeated || 0}</b><span>Threats defeated</span></div>
              <div><b>{unlockedAchievements.length}</b><span>Achievements</span></div>
            </div>
            <div className="sg-hero__cta">
              <button className="sg-btn sg-btn--primary" onClick={() => begin('campaign')}>Continue the campaign</button>
              <button className="sg-btn" disabled={!hasSave || busy} onClick={resume}>Continue saved run</button>
              <button className="sg-btn" onClick={() => begin('endless')}>Expedition / Endless</button>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="sg-shell">
      <div className="sg-titlebar sg-shell__titlebar">
        <div className="sg-titlebar__brand">
          <img src="./logo.png" alt="" className="sg-titlebar__logo" />
          <span className="sg-titlebar__wordmark"><b>Pampanaa</b><span>Last Settlement</span></span>
        </div>
        <div className="sg-titlebar__spacer" />
        <div className="sg-winbox">
          <button type="button" className="sg-titlebar__button" aria-label="Minimize window" onClick={() => window.electron?.window?.minimize?.()}>&#9472;</button>
          <span className="sg-winbox__divider" />
          <button type="button" className="sg-titlebar__button" aria-label="Maximize window" onClick={() => window.electron?.window?.toggleMaximize?.()}>&#9723;</button>
          <span className="sg-winbox__divider" />
          <button type="button" className="sg-titlebar__button sg-titlebar__button--close" aria-label="Close window" onClick={() => window.electron?.window?.close?.()}>&#10005;</button>
        </div>
      </div>

      <aside className="sg-shell__nav">
        <nav className="sg-nav">
          {FRONTEND_NAVIGATION.map((item) => (
            <button key={item.id} className="sg-nav__item" data-active={section === item.id} onClick={() => select(item.id)}>
              <span className="sg-nav__label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="sg-shell__content">
        {section !== FRONTEND_ROUTES.HOME && (
          <div className="sg-crumb">
            <button className="sg-btn sg-btn--sm" onClick={goHome}>&larr; Command</button>
            <span className="sg-crumb__here">{FRONTEND_NAVIGATION.find((item) => item.id === section)?.label || 'Saves'}</span>
          </div>
        )}
        <div className="sg-player-header">
          <div className="sg-player-header__info">
            <PlayerShooter size={48} shipDesign={settings.shipDesign} />
            <div><span className="sg-player-header__name">{profile}</span><span className="sg-muted">Warden</span></div>
          </div>
          <button className="sg-btn sg-btn--sm" onClick={signOut}>Switch Player</button>
        </div>
        {renderSection()}
      </main>
    </div>
  );
}

export default MenuShell;
