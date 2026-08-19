import { useCallback, useEffect, useRef, useState } from 'react';
import GameCanvas from './GameCanvas';
import GameHUD from './GameHUD';
import PauseMenu from './PauseMenu';
import GameOverScreen from './GameOverScreen';
import RuntimeNotice from './RuntimeNotice';
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
import { appendUpdate, UPDATE_TYPES } from '../../application/ui/updateLogModel';

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
  const [updates, setUpdates] = useState([]);
  const [notice, setNotice] = useState(null);
  const [playerLoadout, setPlayerLoadout] = useState(null);
  const [playerBuffs, setPlayerBuffs] = useState({});
  const [threatCatalog, setThreatCatalog] = useState([]);
  const [bossCatalog, setBossCatalog] = useState([]);
  const [runtimeSession, setRuntimeSession] = useState(null);
  const bestWaveRef = useRef(progress.highestWaveReached);
  const mission = MISSION_CATALOG.find((item) => item.id === missionId) || MISSION_CATALOG[0];
  const scheme = settings.controlScheme === 'auto' ? (typeof window !== 'undefined' && 'ontouchstart' in window ? 'touch' : 'keyboard') : settings.controlScheme;
  const touch = useTouchControls(scheme === 'touch');

  const addUpdate = useCallback((type, title, message) => setUpdates((current) => appendUpdate(current, { type, title, message })), []);
  const showNotice = useCallback((title, message) => setNotice({ id: `${Date.now()}_${Math.random()}`, title, message, duration: 2400 }), []);

  useEffect(() => { resumeAudio(); }, [resumeAudio]);
  useEffect(() => { if (!settings.showFps) return undefined; const id = setInterval(() => setFps(engineRef.current?.fps ?? 0), 500); return () => clearInterval(id); }, [settings.showFps]);
  useEffect(() => {
    addUpdate(UPDATE_TYPES.MISSION, mission.title, mission.description);
    showNotice(mission.title, mission.description);
  }, [addUpdate, mission.description, mission.title, showNotice]);

  const unlockById = useCallback(async (id) => {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;
    const created = await tryUnlockAchievement(def);
    if (created) {
      const title = 'Achievement unlocked';
      const message = def.title || def.name || 'A new achievement was recorded.';
      addUpdate(UPDATE_TYPES.PROGRESSION, title, message);
      showNotice(title, message);
    }
    if (created && def.skin) {
      const skins = new Set(progress.unlockedSkins || ['default']);
      skins.add(def.skin);
      await saveProgress({ unlockedSkins: [...skins] });
    }
  }, [addUpdate, progress.unlockedSkins, saveProgress, showNotice, tryUnlockAchievement]);

  const handleEvent = useCallback(async (name, payload = {}) => {
    const engine = engineRef.current;
    if (name === 'PLAYER_LOADOUT_UPDATED') {
      setPlayerLoadout(payload.loadout ?? null);
      setPlayerBuffs(payload.buffs ?? {});
      return;
    }
    if (name === 'BOSS_ENTERED') {
      addUpdate(UPDATE_TYPES.MISSION, payload.boss?.name || 'Major threat', payload.boss?.storyRole || 'A major threat has entered the encounter.');
      showNotice(payload.boss?.name || 'Major threat', payload.boss?.title || 'A major threat has entered the encounter.');
    }
    if (name === 'BOSS_PHASE_CHANGED') {
      addUpdate(UPDATE_TYPES.MISSION, 'Boss phase changed', `The encounter has entered ${payload.phase}.`);
      showNotice('Phase changed', `The encounter has entered ${payload.phase}.`);
    }
    if (name === 'kill') {
      const total = (progress.totalEnemiesDefeated || 0) + 1;
      if (total === 1) unlockById('first_blood');
      if (total >= ACHIEVEMENT_THRESHOLDS.CENTURY_KILLS) unlockById('century');
      if (total % 10 === 0 || total === 1) {
        await saveProgress({ totalEnemiesDefeated: total });
        addUpdate(UPDATE_TYPES.PROGRESSION, 'Progress recorded', `${total} total threats cleared.`);
      }
    }
    if (name === 'bossDefeated') {
      unlockById('first_boss');
      addUpdate(UPDATE_TYPES.MISSION, 'Encounter complete', 'The major encounter has been resolved.');
      showNotice('Encounter complete', 'The major encounter has been resolved.');
    }
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
      addUpdate(UPDATE_TYPES.MISSION, `Encounter ${wave}`, 'The encounter has advanced.');
      showNotice(`Encounter ${wave}`, 'The encounter has advanced.');
    }
    if (name === 'gameOver') {
      setIsBest(payload.wave > (bestWaveRef.current || 0));
      setGameOver(true);
      addUpdate(UPDATE_TYPES.SYSTEM, 'Run ended', `The mission ended at encounter ${payload.wave}.`);
      const stats = structuredClone(progress.stats);
      stats.totalDeaths += 1; stats.gamesPlayed += 1;
      for (const [type, count] of Object.entries(engine.killsByType)) stats.totalKillsByType[type] = (stats.totalKillsByType[type] || 0) + count;
      for (const [key, count] of Object.entries(engine.shotsByWeapon)) stats.shotsFiredByWeapon[key] = (stats.shotsFiredByWeapon[key] || 0) + count;
      await saveProgress({ stats, totalEnemiesDefeated: progress.totalEnemiesDefeated || 0, totalPlayTime: Math.round((progress.totalPlayTime || 0) + engine.playTime), highestWaveReached: Math.max(progress.highestWaveReached || 0, payload.wave) });
      await clearGameSnapshot(); setHasSave(false);
    }
  }, [addUpdate, missionId, progress, saveProgress, settings.autoSave, settings.difficultyLevel, setHasSave, showNotice, unlockById]);

  const handleSync = useCallback((patch) => {
    syncFromEngine(patch);
    if (patch.playerLoadout) setPlayerLoadout(patch.playerLoadout);
    if (patch.playerBuffs) setPlayerBuffs(patch.playerBuffs);
    if (patch.threatCatalog) setThreatCatalog(patch.threatCatalog);
    if (patch.bossCatalog) setBossCatalog(patch.bossCatalog);
    if (patch.runtimeSession) setRuntimeSession(patch.runtimeSession);
  }, [syncFromEngine]);

  const togglePause = useCallback(() => { if (!gameOver) setPaused((p) => !p); }, [gameOver]);
  const openSaveSlots = () => { const engine = engineRef.current; if (!engine || engine.boss) return; setSaveSnapshot({ ...engine.snapshot(), missionId }); };
  const commitSave = async () => { if (saveSnapshot) await persistGameSnapshot(saveSnapshot); setSaveSnapshot(null); setHasSave(true); onQuit(); };
  const restart = () => { setGameOver(false); setPaused(false); setUpdates([]); setNotice(null); setPlayerLoadout(null); setPlayerBuffs({}); setThreatCatalog([]); setBossCatalog([]); setRuntimeSession(null); syncFromEngine({ status: 'playing' }); setRunKey((k) => k + 1); };

  return (
    <div className="sg-game">
      <GameCanvas key={runKey} mode={mode} mission={mission} startWave={startWave} resumeSnapshot={runKey === 0 ? resumeSnapshot : null} paused={paused || gameOver} scheme={scheme} touch={touch} engineRef={engineRef} onEngineEvent={handleEvent} onTogglePause={togglePause} />
      <GameHUD hud={hud} mode={mode} mission={mission} fps={settings.showFps ? fps : null} />
      <RuntimeNotice notice={notice} onClear={() => setNotice(null)} />
      {scheme === 'touch' && <div className="sg-overlay" style={{ pointerEvents: 'none' }}><TouchControls onMove={touch.setMove} onFire={touch.setFiring} /></div>}
      {paused && !gameOver && !pauseSettingsOpen && !saveSnapshot && (
        <PauseMenu
          updates={updates}
          playerLoadout={playerLoadout}
          playerBuffs={playerBuffs}
          threatCatalog={threatCatalog}
          bossCatalog={bossCatalog}
          runtimeSession={runtimeSession}
          onResume={() => setPaused(false)}
          onSaveQuit={openSaveSlots}
          onQuit={onQuit}
          onSettings={() => setPauseSettingsOpen(true)}
          saveDisabled={!!engineRef.current?.boss}
        />
      )}
      {saveSnapshot && <SaveSlotDialog snapshot={saveSnapshot} defaultName={`${mission.title} · Encounter ${saveSnapshot.wave || 1}`} onSaved={commitSave} onCancel={() => setSaveSnapshot(null)} />}
      {pauseSettingsOpen && <div className="sg-modal"><div className="sg-modal__inner sg-modal__inner--wide"><Settings onBack={() => setPauseSettingsOpen(false)} isModal backLabel="Back to pause" /></div></div>}
      {gameOver && <GameOverScreen score={hud.score} wave={hud.wave} isBest={isBest} onSubmit={(name) => submitScore({ name, score: hud.score, wave: hud.wave, mode })} onRestart={restart} onQuit={onQuit} />}
    </div>
  );
}

export default GameContainer;
