export const WARDEN_DESIGNS = Object.freeze({
  INTERCEPTOR: 'interceptor',
  VANGUARD: 'vanguard',
  RANGER: 'ranger',
});

export const WARDEN_DEFAULTS = Object.freeze({
  design: WARDEN_DESIGNS.INTERCEPTOR,
  accent: '#7dd3fc',
  cockpit: '#0b1728',
  hull: '#d8e4ef',
  trim: '#64748b',
});

export function normaliseWardenDesign(value) {
  return Object.values(WARDEN_DESIGNS).includes(value) ? value : WARDEN_DEFAULTS.design;
}

export function createWardenVisual(input = {}) {
  return Object.freeze({
    design: normaliseWardenDesign(input.design),
    accent: input.accent ?? WARDEN_DEFAULTS.accent,
    cockpit: input.cockpit ?? WARDEN_DEFAULTS.cockpit,
    hull: input.hull ?? WARDEN_DEFAULTS.hull,
    trim: input.trim ?? WARDEN_DEFAULTS.trim,
  });
}
