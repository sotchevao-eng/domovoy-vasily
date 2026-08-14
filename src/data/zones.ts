import type { HouseZone } from '../types/game';

export const HOUSE_ZONE_LABELS: Record<HouseZone, string> = {
  roof: 'Крыша',
  entrance: 'Подъезд',
  stairs: 'Лестница',
  elevator: 'Лифт',
  yard: 'Двор',
  parking: 'Парковка',
  waste: 'Контейнерная площадка',
  technical: 'Техническая зона',
  lobby: 'Холл',
};

export const HOUSE_ZONES = Object.keys(HOUSE_ZONE_LABELS) as HouseZone[];

export function getHouseZoneLabel(zone: HouseZone | null | undefined): string {
  if (!zone) {
    return '';
  }

  return HOUSE_ZONE_LABELS[zone];
}

const EVENT_ZONE_MARKERS: Record<string, string> = {
  'water-leak': '💧',
  'burnt-lamp': '💡',
  'boxes-by-elevator': '📦',
  'broken-bench': '🪵',
  'stranger-at-door': '🚪',
  'blocked-driveway': '🚗',
  'flower-bed': '🌸',
  'noise-complaint': '🔊',
  'lost-dog': '🐕',
  'broken-intercom': '🔔',
  'cheap-contractor': '🔧',
  'cctv-request': '📹',
  'old-furniture': '🪑',
  'cleaning-complaint': '🧹',
  'meeting-notice': '📋',
  'tea-break': '☕',
  'lost-keys': '🔑',
  'kind-neighbor': '🌱',
  'another-box': '📦',
  'kind-note': '📝',
  'cat-guest': '🐈',
  'neighbor-help': '🤝',
  'stuck-elevator': '🛗',
  'winter-icicles': '❄️',
  'summer-heat': '☀️',
  'cat-in-basement': '🐈',
  'parking-marking': '🅿️',
  'protocol-missing': '📄',
  'roof-after-rain': '🌧️',
  'bike-in-lobby': '🚲',
  'mailboxes-broken': '📬',
  'playground-sand': '🛝',
  'snow-not-cleared': '⛄',
  'dryer-on-stairs': '👕',
  'meeting-quorum': '🗳️',
  'invoice-unclear': '🧾',
  'stray-cats-feeding': '🐟',
};

export function getEventZoneMarker(eventId: string | null | undefined): string | undefined {
  if (!eventId) {
    return undefined;
  }

  return EVENT_ZONE_MARKERS[eventId];
}

export const HOUSE_ZONE_MARKERS: Record<HouseZone, { x: number; y: number }> = {
  roof: { x: 150, y: 28 },
  stairs: { x: 96, y: 132 },
  elevator: { x: 128, y: 132 },
  lobby: { x: 176, y: 214 },
  entrance: { x: 150, y: 228 },
  technical: { x: 48, y: 176 },
  yard: { x: 150, y: 278 },
  parking: { x: 40, y: 292 },
  waste: { x: 262, y: 292 },
};
