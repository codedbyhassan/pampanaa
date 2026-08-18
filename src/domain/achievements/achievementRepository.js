export function createAchievementRepository(operations) {
  const required = ['listUnlocked', 'unlock'];
  for (const name of required) {
    if (typeof operations?.[name] !== 'function') {
      throw new TypeError(`Achievement repository requires ${name}().`);
    }
  }
  return Object.freeze({ ...operations });
}
