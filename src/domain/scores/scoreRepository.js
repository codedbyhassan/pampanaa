export function createScoreRepository(operations) {
  const required = ['add', 'top', 'profile'];
  for (const name of required) {
    if (typeof operations?.[name] !== 'function') {
      throw new TypeError(`Score repository requires ${name}().`);
    }
  }
  return Object.freeze({ ...operations });
}
