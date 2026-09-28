/** Zone identity helpers — Fire / ICT */

export const ZONES = {
  fire: {
    id: 'fire',
    number: '01',
    label: 'FIRE DETECTION',
    shortLabel: 'Fire Safety',
    tag: 'ZONE 01 · FIRE DETECTION',
    color: 'var(--zone-fire)',
    colorToken: '--zone-fire',
    types: ['fire_safety', 'fire', 'fire-safety', 'firesafety'],
  },
  ict: {
    id: 'ict',
    number: '02',
    label: 'ICT & SECURITY',
    shortLabel: 'ICT & Security',
    tag: 'ZONE 02 · ICT & SECURITY',
    color: 'var(--zone-ict)',
    colorToken: '--zone-ict',
    types: [
      'ict',
      'telecom',
      'telecommunication',
      'telecommunications',
      'security',
      'cctv',
      'surveillance',
      'access_control',
      'access-control',
      'structured_cabling',
      'structured-cabling',
      'networking',
      'network',
      'data',
      'voice',
    ],
  },
};

/**
 * Solar is no longer offered. Any leftover solar categories coming from the
 * backend are recognised here so they can be hidden from menus, search and pages.
 */
const SOLAR_TYPES = ['solar', 'solar_solutions', 'solar-solutions', 'power'];

export function normalizeType(type) {
  return String(type || '').toLowerCase().trim();
}

export function isSolarType(type) {
  return SOLAR_TYPES.includes(normalizeType(type));
}

export function getZoneFromType(type) {
  const t = normalizeType(type);
  if (ZONES.fire.types.includes(t)) return ZONES.fire;
  if (ZONES.ict.types.includes(t)) return ZONES.ict;
  return ZONES.fire;
}

export function isFireType(type) {
  return ZONES.fire.types.includes(normalizeType(type));
}

export function isIctType(type) {
  return ZONES.ict.types.includes(normalizeType(type));
}

export function filterByZone(categories, zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) return [];
  return (categories || []).filter((cat) =>
    zone.types.includes(normalizeType(cat.type))
  );
}