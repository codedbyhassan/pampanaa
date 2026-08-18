export function createSaveRepository(operations) {
  const required = [
    'saveLatest',
    'loadLatest',
    'clearLatest',
    'savePreset',
    'listPresets',
    'loadPreset',
    'overwritePreset',
    'renamePreset',
    'deletePreset',
  ];

  for (const name of required) {
    if (typeof operations?.[name] !== 'function') {
      throw new TypeError(`Save repository requires ${name}().`);
    }
  }

  return Object.freeze({ ...operations });
}
