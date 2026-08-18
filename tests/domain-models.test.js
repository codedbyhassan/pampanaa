import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createProfile,
  createSettings,
  createProgress,
  recordWaveCleared,
  createSave,
  createAchievement,
  createScore,
  createGameSession,
  startGameSession,
} from '../src/domain/index.js';

test('profile identity is stable while display name is mutable', () => {
  const profile = createProfile({ name: ' Hassan  ' });
  const renamed = createProfile({ ...profile, name: 'Hassan A.' });
  assert.match(profile.profileId, /^pmp_/);
  assert.equal(profile.name, 'Hassan');
  assert.equal(renamed.profileId, profile.profileId);
  assert.equal(renamed.name, 'Hassan A.');
});

test('settings normalize bounded values', () => {
  const settings = createSettings({ volume: 9, difficultyLevel: 99, musicEnabled: false });
  assert.equal(settings.volume, 1);
  assert.equal(settings.difficultyLevel, 10);
  assert.equal(settings.musicEnabled, false);
  assert.equal(settings.schemaVersion, 1);
});

test('progress preserves invariants when recording a wave', () => {
  const progress = createProgress({ highestWaveReached: 2 });
  const next = recordWaveCleared(progress, 4, 1500);
  assert.deepEqual(next.clearedWaves, [4]);
  assert.equal(next.bestScoreByWave[4], 1500);
  assert.equal(next.highestWaveReached, 5);
});

test('owned records require profile identity', () => {
  assert.throws(() => createSave({}), /profileId/);
  assert.throws(() => createAchievement({ achievementId: 'first' }), /profileId/);
  assert.throws(() => createScore({ score: 10 }), /profileId/);
});

test('game sessions have controlled lifecycle states', () => {
  const session = createGameSession({ profileId: 'pmp_test', status: 'ready' });
  const running = startGameSession(session);
  assert.equal(session.status, 'ready');
  assert.equal(running.status, 'running');
  assert.equal(running.isPaused, false);
});
