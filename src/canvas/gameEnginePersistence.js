import { GameEngine } from './GameEngine';
import { WORLD } from '../utils/constants';

if (!GameEngine.prototype.snapshot) {
  GameEngine.prototype.snapshot = function snapshot() {
    return {
      score: this.score,
      wave: this.wave,
      mode: this.mode,
      weapon: this.currentWeaponKey,
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        health: this.player.health,
        activeBuffs: { ...this.player.activeBuffs },
        weaponAmps: JSON.parse(JSON.stringify(this.player.weaponAmps || {})),
      },
      combo: this.combo,
      comboTimer: this.comboTimer,
      enemies: this.enemies.filter((enemy) => enemy.active && enemy.type !== 'Boss').map((enemy) => enemy.snapshot()),
    };
  };
}

if (!GameEngine.prototype.restore) {
  GameEngine.prototype.restore = function restore(snapshot = {}) {
    this.score = snapshot.score || 0;
    this.wave = snapshot.wave || 1;
    this.startingWave = this.wave;
    this.player.x = snapshot.player?.x ?? WORLD.width / 2;
    this.player.y = snapshot.player?.y ?? WORLD.height * 0.78;
    this.player.health = snapshot.player?.health ?? this.player.maxHealth;
    this.player.activeBuffs = { ...this.player.activeBuffs, ...(snapshot.player?.activeBuffs || {}) };
    if (snapshot.player?.weaponAmps) this.player.weaponAmps = JSON.parse(JSON.stringify(snapshot.player.weaponAmps));
    if (snapshot.weapon && this.isUnlocked(snapshot.weapon)) this.currentWeaponKey = snapshot.weapon;
    this.player.activeWeaponKey = this.currentWeaponKey;
    this.combo = snapshot.combo || 0;
    this.comboTimer = snapshot.comboTimer || 0;
    this.enemies = (snapshot.enemies || []).map((item) => {
      const enemy = this.createEnemy(item.type, item.x, item.y);
      enemy.maxHealth = item.maxHealth ?? enemy.maxHealth;
      enemy.health = item.health ?? enemy.health;
      if (item.isSplit) enemy.isSplit = true;
      if (item.slot) enemy.assignSlot(item.slot, 0);
      return enemy;
    });
    this.waveStarted = this.enemies.length > 0;
    this.waveBannerTimer = this.waveStarted ? 0 : 1.2;
    this.sync({ score: this.score, wave: this.wave, health: this.player.health, weapon: this.currentWeaponKey, buffs: { ...this.player.activeBuffs }, amps: { ...this.player.amps }, combo: this.combo, comboMultiplier: 1 + Math.floor(this.combo / 5) * 0.5 });
  };
}

export default GameEngine;
