/**
 * Profile repository contract.
 *
 * The domain/application layers depend on this shape rather than IndexedDB.
 * Infrastructure adapters implement the contract.
 */
export function createProfileRepository({
  list,
  get,
  signIn,
  rename,
  signOut,
  touch,
  remove,
  getActiveName,
}) {
  const required = { list, get, signIn, rename, signOut, touch, remove, getActiveName };
  for (const [name, operation] of Object.entries(required)) {
    if (typeof operation !== 'function') {
      throw new TypeError(`Profile repository requires ${name}().`);
    }
  }

  return Object.freeze(required);
}
