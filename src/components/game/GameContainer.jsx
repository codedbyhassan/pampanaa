import { useCallback, useEffect, useRef, useState } from 'react';
import GameCanvas from './GameCanvas';
import GameHUD from './GameHUD';
import PauseMenu from './PauseMenu';
import GameOverScreen from './GameOverScreen';
import TouchControls from './TouchControls';
import Settings from '../../pages/Settings';
import { useGame } from '../../contexts/GameContext';
import { useAudio } from '../../contexts/AudioContext';
import { useTouchControls } from '../../hooks/useTouchControls';
import SaveSlotDialog from './SaveSlotDialog';
import { ACHIEVEMENTS } from '../../utils/achievementDefs';
import { ACHIEVEMENT_THRESHOLDS } from '../../utils/constants';
import { MISSION_CATALOG } from '../../domain/campaign/missionCatalog';
import { persistGameSnapshot, clearGameSnapshot, recordCompletedEncounter, submitScore } from '../../application/persistence/gamePersistence';

export function GameContainer({ mode, missionId = 'mission_1', startWave = 1, resumeSnapshot, onQuit }) {
  const { hud, settings, progress, saveProgress, tryUnlockAchievement, syncFromEngine, setHasSave } = useGame();
  const { resumeAudio } = useAudio();
  const engineRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [pauseSettingsOpen, setPauseSettingsOpen] = useState(false);
  const [saveSnapshot, setSaveSnapshot] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isBest, setIsBest] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [fps, setFps] = useState(0);
  const bestWaveRef = useRef(progress.highestWaveReached);
  const mission = MISSION_CATALOG.find((item) => item.id === missionId) || MISSION_CATALOG[0];
  const scheme = settings.controlScheme === 'auto' ? (typeof window !== 'undefined' && 'ontouchstart' in window ? 'touch' : 'keyboard') : settings.controlScheme;
  const touch = useTouchControls(scheme === 'touch');

  useEffect(() => { resumeAudio(); }, [resumeAudio]);
  useEffect(() => { if (!settings.showFps) return undefined; const id = setInterval(() => setFps(engineRef.current?.fps ?? 0), 500); return () => clearInterval(id); }, [settings.showFps]);

  const unlockById = useCallback(async (id) => {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;
    const created = await tryUnlockAchievement(def);
    if (created && def.skin) {
      const skins = new Set(progress.unlockedSkins || ['default']);
      skins.add(def.skin);
      await saveProgress({ unlockedSkins: [...skins] });
    }
  }, [progress.unlockedSkins, saveProgress, tryUnlockAchievement]);

  const handleEvent = useCallback(async (name, payload) => {
    const engine = engineRef.current;
    if (name === 'kill') {
      const total = (progress.totalEnemiesDefeated || 0) + 1;
      if (total === 1) unlockById('first_blood');
      if (total >= ACHIEVEMENT_THRESHOLDS.CENTURY_KILLS) unlockById('century');
      if (total % 10 === 0 || total === 1) await saveProgress({ totalEnemiesDefeated: total });
    }
    if (name === 'bossDefeated') unlockById('first_boss');
    if (name === 'waveAdvance') {
      const wave = payload.wave;
      if (wave >= ACHIEVEMENT_THRESHOLDS.WAVE_5) unlockById('wave_5');
      if (wave >= ACHIEVEMENT_THRESHOLDS.WAVE_10 && settings.difficultyLevel >= ACHIEVEMENT_THRESHOLDS.HARD_DIFFICULTY) unlockById('hard_wave_10');
      const patch = { unlockedWeapons: [...engine.unlockedWeapons] };
      if (wave > (progress.highestWaveReached || 0)) patch.highestWaveReached = wave;
      await saveProgress(patch);
      await recordCompletedEncounter(wave - 1, engine.score);
      if (settings.autoSave !== false) {
        await persistGameSnapshot({ ...engine.snapshot(), missionId });
        setHasSave(true);
      }
    }
    if (name === 'gameOver') {
      setIsBest(payload.wave > (bestWaveRef.current || 0));
      setGameOver(true);
      const stats = structuredClone(progress.stats);
      stats.totalDeaths += 1; stats.gamesPlayed += 1;
      for (const [type, count] of Object.entries(engine.killsByType)) stats.totalKillsByType[type] = (stats.totalKillsByType[type] || 0) + count;
      for (const [key, count] of Object.entries(engine.shotsByWeapon)) stats.shotsFiredByWeapon[key] = (stats.shotsFiredByWeapon[key] || 0) + count;
      await saveProgress({ stats, totalEnemiesDefeated: progress.totalEnemiesDefeated || 0, totalPlayTime: Math.round((progress.totalPlayTime || 0) + engine.playTime), highestWaveReached: Math.max(progress.highestWaveReached || 0, payload.wave) });
      await clearGameSnapshot(); setHasSave(false);
    }
  }, [missionId, progress, saveProgress, settings.autoSave, settings.difficultyLevel, setHasSave, unlockById]);

  const togglePause = useCallback(() => { if (!gameOver) setPaused((p) => !p); }, [gameOver]);
  const openSaveSlots = () => { const engine = engineRef.current; if (!engine || engine.boss) return; setSaveSnapshot({ ...engine.snapshot(), missionId }); };
  const commitSave = async () => { if (saveSnapshot) await persistGameSnapshot(saveSnapshot); setSaveSnapshot(null); setHasSave(true); onQuit(); };
  const restart = () => { setGameOver(false); setPaused(false); syncFromEngine({ status: 'playing' }); setRunKey((k) => k + 1); };

  return (
    <div className="sg-game">
      <GameCanvas key={runKey} mode={mode} startWave={startWave} resumeSnapshot={runKey === 0 ? resumeSnapshot : null} paused={paused || gameOver} scheme={scheme} touch={touch} engineRef={engineRef} onEngineEvent={handleEvent} onTogglePause={togglePause} />
      <GameHUD hud={hud} mode={mode} mission={mission} fps={settings.showFps ? fps : null} />
      {scheme === 'touch' && <div className="sg-overlay" style={{ pointerEvents: 'none' }}><TouchControls onMove={touch.setMove} onFire={touch.setFiring} /></div>}
      {paused && !gameOver && !pauseSettingsOpen && !saveSnapshot && <PauseMenu onResume={() => setPaused(false)} onSaveQuit={openSaveSlots} onQuit={onQuit} onSettings={() => setPauseSettingsOpen(true)} saveDisabled={!!engineRef.current?.boss} />}
      {saveSnapshot && <SaveSlotDialog snapshot={saveSnapshot} defaultName={`${mission.title} · Wave ${saveSnapshot.wave || 1}`} onSaved={commitSave} onCancel={() => setSaveSnapshot(null)} />}
      {pauseSettingsOpen && <div className="sg-modal"><div className="sg-modal__inner sg-modal__inner--wide"><Settings onBack={() => setPauseSettingsOpen(false)} isModal backLabel="Back to pause" /></div></div>}
      {gameOver && <GameOverScreen score={hud.score} wave={hud.wave} isBest={isBest} onSubmit={(name) => submitScore({ name, score: hud.score, wave: hud.wave, mode })} onRestart={restart} onQuit={onQuit} />}
    </div>
  );
}

export default GameContainer;
