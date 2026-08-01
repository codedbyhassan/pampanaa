import { useCallback, useEffect, useRef, useState } from 'react';
import GameCanvas from './GameCanvas';
import GameHUD from './GameHUD';
import PauseMenu from './PauseMenu';
import GameOverScreen from './GameOverScreen';
import TouchControls from './TouchControls';
import { useGame } from '../../contexts/GameContext';
import { useAudio } from '../../contexts/AudioContext';
import { useTouchControls } from '../../hooks/useTouchControls';
import { addScore } from '../../database/scores';
import { saveGame, clearSave } from '../../database/saves';
import { ACHIEVEMENTS } from '../../utils/achievementDefs';
import { SHOW_FPS } from '../../utils/constants';

export function GameContainer({ mode, resumeSnapshot, onQuit }) {
  const { hud, settings, progress, saveProgress, tryUnlockAchievement, syncFromEngine, setHasSave } = useGame();
  const { resumeAudio } = useAudio();
  const engineRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isBest, setIsBest] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [fps, setFps] = useState(0);
  const bestWaveRef = useRef(progress.highestWaveReached);

  const scheme =
    settings.controlScheme === 'auto'
      ? typeof window !== 'undefined' && 'ontouchstart' in window
        ? 'touch'
        : 'keyboard'
      : settings.controlScheme;
  const touch = useTouchControls(scheme === 'touch');

  useEffect(() => {
    resumeAudio();
  }, [resumeAudio]);

  useEffect(() => {
    if (!SHOW_FPS) return undefined;
    const id = setInterval(() => setFps(engineRef.current?.fps ?? 0), 500);
    return () => clearInterval(id);
  }, []);

  const unlockById = useCallback(
    async (id) => {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (!def) return;
      const created = await tryUnlockAchievement(def);
      if (created && def.skin) {
        const skins = new Set(progress.unlockedSkins || ['default']);
        skins.add(def.skin);
        await saveProgress({ unlockedSkins: [...skins] });
      }
    },
    [progress.unlockedSkins, saveProgress, tryUnlockAchievement],
  );

  const handleEvent = useCallback(
    async (name, payload) => {
      const engine = engineRef.current;
      if (name === 'kill') {
        const total = (progress.totalEnemiesDefeated || 0) + 1;
        if (total === 1) unlockById('first_blood');
        if (total >= 100) unlockById('century');
        // Batched persistence: progress written on discrete milestones only.
        if (total % 10 === 0 || total === 1) saveProgress({ totalEnemiesDefeated: total });
        else progress.totalEnemiesDefeated = total;
      }
      if (name === 'bossDefeated') unlockById('first_boss');
      if (name === 'waveAdvance') {
        const wave = payload.wave;
        if (wave >= 5) unlockById('wave_5');
        if (wave >= 10 && settings.difficulty === 'hard') unlockById('hard_wave_10');
        const patch = { unlockedWeapons: [...engine.unlockedWeapons] };
        if (wave > (progress.highestWaveReached || 0)) patch.highestWaveReached = wave;
        saveProgress(patch);
      }
      if (name === 'gameOver') {
        setIsBest(payload.wave > (bestWaveRef.current || 0));
        setGameOver(true);
        const stats = structuredClone(progress.stats);
        stats.totalDeaths += 1;
        stats.gamesPlayed += 1;
        for (const [type, count] of Object.entries(engine.killsByType)) {
          stats.totalKillsByType[type] = (stats.totalKillsByType[type] || 0) + count;
        }
        for (const [key, count] of Object.entries(engine.shotsByWeapon)) {
          stats.shotsFiredByWeapon[key] = (stats.shotsFiredByWeapon[key] || 0) + count;
        }
        await saveProgress({
          stats,
          totalEnemiesDefeated: progress.totalEnemiesDefeated || 0,
          totalPlayTime: Math.round((progress.totalPlayTime || 0) + engine.playTime),
          highestWaveReached: Math.max(progress.highestWaveReached || 0, payload.wave),
        });
        await clearSave();
        setHasSave(false);
      }
    },
    [progress, saveProgress, settings.difficulty, setHasSave, unlockById],
  );

  const togglePause = useCallback(() => {
    if (gameOver) return;
    setPaused((p) => !p);
  }, [gameOver]);

  const handleSaveQuit = async () => {
    const engine = engineRef.current;
    if (engine) await saveGame(engine.snapshot());
    setHasSave(true);
    onQuit();
  };

  const restart = () => {
    setGameOver(false);
    setPaused(false);
    syncFromEngine({ status: 'playing' });
    setRunKey((k) => k + 1);
  };

  return (
    <div className="sg-game">
      <GameCanvas
        key={runKey}
        mode={mode}
        resumeSnapshot={runKey === 0 ? resumeSnapshot : null}
        paused={paused || gameOver}
        scheme={scheme}
        touch={touch}
        engineRef={engineRef}
        onEngineEvent={handleEvent}
        onTogglePause={togglePause}
      />
      <GameHUD hud={hud} mode={mode} fps={SHOW_FPS ? fps : null} />
      {scheme === 'touch' && (
        <div className="sg-overlay" style={{ pointerEvents: 'none' }}>
          <TouchControls onMove={touch.setMove} onFire={touch.setFiring} />
        </div>
      )}
      {paused && !gameOver && (
        <PauseMenu onResume={() => setPaused(false)} onSaveQuit={handleSaveQuit} onQuit={onQuit} />
      )}
      {gameOver && (
        <GameOverScreen
          score={hud.score}
          wave={hud.wave}
          isBest={isBest}
          onSubmit={(name) => addScore({ name, score: hud.score, wave: hud.wave, mode })}
          onRestart={restart}
          onQuit={onQuit}
        />
      )}
    </div>
  );
}

export default GameContainer;
