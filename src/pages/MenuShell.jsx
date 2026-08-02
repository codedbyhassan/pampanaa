import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { loadLatestSave } from '../database/saves';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import Achievements from './Achievements';
import Stats from './Stats';
import LevelSelect from './LevelSelect';

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
    setBusy(true);
    const save = await loadLatestSave();
    setBusy(false);
    if (save) {
      resumeAudio();
      onContinue(save);
    }
  };

  const NAV = [
    { id: 'new', label: 'Start New Game', hint: 'Begin a fresh campaign', action: () => begin('campaign') },
    {
      id: 'continue',
      label: 'Continue Game',
      hint: hasSave ? `Resume wave ${progress.highestWaveReached || 1}` : 'No saved run yet',
      action: resume,
      disabled: !hasSave,
    },
    { id: 'endless', label: 'Endless Mode', hint: 'Survive as long as you can', action: () => begin('endless') },
    { id: 'levels', label: 'Missions', hint: 'Replay cleared waves' },
    { id: 'leaderboard', label: 'Leaderboard', hint: 'Best runs on this device' },
    { id: 'achievements', label: 'Achievements', hint: `${unlockedAchievements.length} unlocked` },
    { id: 'stats', label: 'Career', hint: 'Lifetime statistics' },
    { id: 'settings', label: 'Settings', hint: 'Difficulty, audio, controls' },
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
              <span className="sg-nav__hint">{item.hint}</span>
            </button>
          ))}
        </nav>

        <div className="sg-shell__foot">
          <div className="sg-shell__player">
            <span className="sg-nav__hint">Signed in</span>
            <b>{profile}</b>
          </div>
          <button className="sg-btn sg-btn--sm" onClick={signOut}>
            Switch player
          </button>
        </div>
      </aside>

      <main className="sg-shell__content">
        {section === 'home' && (
          <section className="sg-hero">
            <div className="sg-hero__badge">Campaign ready</div>
            <h1 className="sg-hero__title">Pampanaa</h1>
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
      </main>
    </div>
  );
}

export default MenuShell;
