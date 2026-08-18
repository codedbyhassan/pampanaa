import test from 'node:test';
import assert from 'node:assert/strict';
import GameClock from '../src/runtime/clock/GameClock.js';
import GameInput from '../src/runtime/input/GameInput.js';
import GameEventBus from '../src/runtime/events/GameEventBus.js';

 test('GameClock clamps long frame gaps', () => {
  const clock = new GameClock();
  clock.start(1000);
  assert.equal(clock.tick(1016), 0.016);
  assert.equal(clock.tick(2016), 0.05);
});

test('GameClock stops producing deltas after stop', () => {
  const clock = new GameClock();
  clock.start(1000);
  clock.stop();
  assert.equal(clock.tick(2000), 0);
});

test('GameInput normalizes invalid values and copies aim', () => {
  const input = new GameInput();
  input.set({ x: 'bad', y: 4, firing: 1, aim: { x: 12, y: 24 } });
  const result = input.read();
  assert.deepEqual(result, { x: 0, y: 4, firing: true, aim: { x: 12, y: 24 } });
  result.aim.x = 99;
  assert.equal(input.read().aim.x, 12);
});

test('GameEventBus supports subscription and cleanup', () => {
  const bus = new GameEventBus();
  const received = [];
  const off = bus.on('MISSION_STARTED', (payload) => received.push(payload.id));
  bus.emit('MISSION_STARTED', { id: 'mission_1' });
  off();
  bus.emit('MISSION_STARTED', { id: 'mission_2' });
  assert.deepEqual(received, ['mission_1']);
});
