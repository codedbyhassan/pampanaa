export const DOMAIN_SCHEMA_VERSION = 1;

export function asFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function asNonNegativeNumber(value, fallback = 0) {
  return Math.max(0, asFiniteNumber(value, fallback));
}

export function asInteger(value, fallback = 0) {
  return Math.trunc(asFiniteNumber(value, fallback));
}

export function asNonNegativeInteger(value, fallback = 0) {
  return Math.max(0, asInteger(value, fallback));
}

export function asBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

export function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export function clone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function freezeModel(model) {
  return Object.freeze(model);
}
