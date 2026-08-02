import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { loadLatestSave } from '../database/saves';
import { PlayerShooter } from '../components/ui/PlayerShooter';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import Achievements from './Achievements';
import Stats from './Stats';
import LevelSelect from './LevelSelect';
import Credits from './Credits';
import Presets from './Presets';

/**
 * AAA-style front end: a persistent left sidebar drives the whole menu, the
 * right pane renders the selected section. "Continue" stays visible but inert
 * for new players so the layout never shifts between sessions.
 */
export function MenuShell({ onStart, onContinue, onPlayWave }) {
  const { progress, hasSave, profile, signOut, unlockedAchievements } = useGame();
  const { resumeAudio } = useAudio();
  const [section, setSection] = useState('home');
  const [busy, setBusy] = useState(false);

  const begin = (mode) => {
    resumeAudio();
    onStart(mode);
  };

  const resume = async () => {
    if (!hasSave || busy) return;
    // Open presets menu instead of auto-loading
    setSection('presets');
  };

  const NAV = [
    { id: 'new', label: 'Start New Game', action: () => begin('campaign') },
    {
      id: 'continue',
      label: 'Continue Game',
      action: resume,
      disabled: !hasSave,
    },
    { id: 'endless', label: 'Endless Mode', action: () => begin('endless') },
    { id: 'levels', label: 'Missions' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'stats', label: 'Career' },
    { id: 'settings', label: 'Settings' },
    { id: 'credits', label: 'Credits' },
  ];

  const select = (item) => {
    if (item.disabled) return;
    if (item.action) item.action();
    else setSection(item.id);
  };

  const activeId = section === 'home' ? null : section;

  return (
    <div className="sg-shell">
      <aside className="sg-shell__nav">
        <button className="sg-shell__brand" onClick={() => setSection('home')}>
          <span className="sg-shell__brandmark">Pampanaa</span>
          <span className="sg-shell__brandsub">Deep Lane Defence</span>
        </button>

        <nav className="sg-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              className="sg-nav__item"
              data-active={activeId === item.id}
              disabled={item.disabled}
              onClick={() => select(item)}
            >
              <span className="sg-nav__label">{item.label}</span>
            </button>
          ))}
        </nav>


      </aside>

      <main className="sg-shell__content">
        <div className="sg-player-header">
          <div className="sg-player-header__info">
            <PlayerShooter size={48} />
            <div>
              <span className="sg-player-header__name">{profile}</span>
            </div>
          </div>
          <button className="sg-btn sg-btn--sm" onClick={signOut}>
            Switch Player
          </button>
        </div>

        {section === 'home' && (
          <section className="sg-hero">
            <img src="/logo.png" alt="Pampanaa" className="sg-hero__logo" />
            <p className="sg-hero__tag">
              Hold the outer lanes against choreographed enemy formations, escalate your
              arsenal, and outlast the capital-class bosses.
            </p>
            <div className="sg-hero__stats">
              <div>
                <b>{progress.highestWaveReached || 0}</b>
                <span>Best wave</span>
              </div>
              <div>
                <b>{progress.totalEnemiesDefeated || 0}</b>
                <span>Ships downed</span>
              </div>
              <div>
                <b>{unlockedAchievements.length}</b>
                <span>Achievements</span>
              </div>
            </div>
            <div className="sg-hero__cta">
              <button className="sg-btn sg-btn--primary" onClick={() => begin('campaign')}>
                Start new game
              </button>
              <button className="sg-btn" disabled={!hasSave || busy} onClick={resume}>
                Continue game
              </button>
            </div>
          </section>
        )}

        {section === 'levels' && (
          <LevelSelect
            onBack={() => setSection('home')}
            onPlayWave={onPlayWave}
            onContinue={onContinue}
          />
        )}
        {section === 'leaderboard' && <Leaderboard onBack={() => setSection('home')} />}
        {section === 'achievements' && <Achievements onBack={() => setSection('home')} />}
        {section === 'stats' && <Stats onBack={() => setSection('home')} />}
        {section === 'settings' && <Settings onBack={() => setSection('home')} />}
        {section === 'credits' && <Credits onBack={() => setSection('home')} />}
        {section === 'presets' && (
          <Presets
            onContinue={onContinue}
            onClose={() => setSection('home')}
          />
        )}
      </main>
    </div>
  );
}

export default MenuShell;
