/** Zone identity helpers — Fire / ICT / Solar */

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
  solar: {
    id: 'solar',
    number: '04',
    label: 'SOLAR & POWER',
    shortLabel: 'Solar & Power',
    tag: 'ZONE 04 · SOLAR & POWER',
    color: 'var(--zone-solar)',
    colorToken: '--zone-solar',
    types: ['solar', 'solar_solutions', 'solar-solutions', 'power'],
  },
};

/** Zone 03 is used on the homepage building section for data/voice (same ICT colour). */
export const ZONE_DATA = {
  id: 'data',
  number: '03',
  label: 'DATA, VOICE & WIRELESS',
  shortLabel: 'Data & Voice',
  tag: 'ZONE 03 · DATA & VOICE',
  color: 'var(--zone-ict)',
  colorToken: '--zone-ict',
};

export function normalizeType(type) {
  return String(type || '').toLowerCase().trim();
}

export function getZoneFromType(type) {
  const t = normalizeType(type);
  if (ZONES.fire.types.includes(t)) return ZONES.fire;
  if (ZONES.ict.types.includes(t)) return ZONES.ict;
  if (ZONES.solar.types.includes(t)) return ZONES.solar;
  return ZONES.fire;
}

export function isFireType(type) {
  return ZONES.fire.types.includes(normalizeType(type));
}

export function isIctType(type) {
  return ZONES.ict.types.includes(normalizeType(type));
}

export function isSolarType(type) {
  return ZONES.solar.types.includes(normalizeType(type));
}

export function filterByZone(categories, zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) return [];
  return (categories || []).filter((cat) =>
    zone.types.includes(normalizeType(cat.type))
  );
}