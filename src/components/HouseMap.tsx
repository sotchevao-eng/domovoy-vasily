import { AlertTriangle } from 'lucide-react';
import type { HouseZone } from '../types/game';
import { HOUSE_ZONE_LABELS, HOUSE_ZONE_MARKERS, getHouseZoneLabel } from '../data/zones';
import type { ZoneMood, ZoneMoodMap } from '../utils/houseMood';
import styles from './HouseMap.module.css';

interface HouseMapProps {
  activeZone?: HouseZone | null;
  compact?: boolean;
  emergency?: boolean;
  marker?: string;
  reduceMotion?: boolean;
  zoneMoods?: ZoneMoodMap;
}

export function HouseMap({
  activeZone = null,
  compact = false,
  emergency = false,
  marker,
  reduceMotion = false,
  zoneMoods = {},
}: HouseMapProps) {
  const label = getHouseZoneLabel(activeZone);
  const status = label ? `Сейчас: ${label}` : 'Дом пока спокоен';
  const markerPos = activeZone ? HOUSE_ZONE_MARKERS[activeZone] : null;
  const wrapClass = [
    styles.wrap,
    compact ? styles.compact : '',
    reduceMotion ? styles.static : '',
    zoneMoods.stairs === 'bad' ? styles.darkStairs : '',
    zoneMoods.entrance === 'bad' ? styles.openEntrance : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={wrapClass} aria-label={`Схема дома. ${status}`}>
      <svg
        className={styles.map}
        viewBox="0 0 300 360"
        role="img"
        aria-labelledby="house-map-title"
      >
        <title id="house-map-title">{`Схема дома ТСЖ «Васильевский». ${status}`}</title>
        <defs>
          <linearGradient id="house-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f7efe3" />
            <stop offset="100%" stopColor="#efe4d2" />
          </linearGradient>
          <linearGradient id="house-wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f3e2c8" />
            <stop offset="100%" stopColor="#e4d0b0" />
          </linearGradient>
          <filter id="house-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#c9a44a" floodOpacity="0.55" />
          </filter>
          <filter id="house-alert" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#c4785a" floodOpacity="0.5" />
          </filter>
        </defs>

        <rect x="8" y="8" width="284" height="344" rx="28" fill="url(#house-sky)" />

        <ellipse cx="150" cy="338" rx="118" ry="12" fill="rgba(109, 143, 114, 0.18)" />

        <ZonePath
          zone="parking"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.parking}
          d="M14 258h64c8 0 12 4 12 12v62c0 8-4 12-12 12H26c-8 0-12-4-12-12v-62c0-8 4-12 12-12z"
        />
        <rect x="24" y="276" width="18" height="28" rx="3" className={styles.detail} />
        <rect x="48" y="276" width="18" height="28" rx="3" className={styles.detail} />
        {zoneMoods.parking === 'bad' ? (
          <rect x="16" y="304" width="44" height="16" rx="4" className={styles.blockingCar} />
        ) : null}

        <ZonePath
          zone="waste"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.waste}
          d="M222 258h64c8 0 12 4 12 12v62c0 8-4 12-12 12h-52c-8 0-12-4-12-12v-62c0-8 4-12 12-12z"
        />
        <rect x="236" y="278" width="16" height="22" rx="3" className={styles.bin} />
        <rect x="256" y="272" width="16" height="28" rx="3" className={styles.bin} />
        {zoneMoods.waste === 'good' ? (
          <rect x="246" y="268" width="14" height="18" rx="2" className={styles.binLid} />
        ) : null}
        {zoneMoods.waste === 'bad' ? (
          <g>
            <ellipse cx="242" cy="306" rx="11" ry="6" className={styles.wastePile} />
            <ellipse cx="268" cy="310" rx="13" ry="7" className={styles.wastePile} />
            <rect x="228" y="266" width="14" height="34" rx="3" className={styles.binOverflow} />
          </g>
        ) : null}

        <ZonePath
          zone="yard"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.yard}
          d="M82 250h136c10 0 16 6 16 14v40c0 8-6 14-16 14H82c-10 0-16-6-16-14v-40c0-8 6-14 16-14z"
        />
        <circle cx="108" cy="278" r="8" className={styles.bush} />
        <circle cx="192" cy="276" r="10" className={styles.bush} />
        <rect x="132" y="270" width="36" height="8" rx="4" className={styles.path} />
        {zoneMoods.yard === 'good' ? (
          <g>
            <circle cx="120" cy="266" r="4" className={styles.flower} />
            <circle cx="168" cy="264" r="3.5" className={styles.flowerAlt} />
            <circle cx="148" cy="262" r="3" className={styles.flower} />
            <circle cx="184" cy="268" r="3.2" className={styles.flowerAlt} />
            <circle cx="102" cy="268" r="6" className={styles.bush} />
          </g>
        ) : null}
        {zoneMoods.yard === 'bad' ? (
          <g>
            <rect x="128" y="268" width="40" height="6" rx="1" className={styles.brokenBench} />
            <rect x="146" y="266" width="4" height="10" rx="1" className={styles.brokenBench} />
          </g>
        ) : null}

        <ZonePath
          zone="technical"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.technical}
          d="M22 150h54c8 0 12 4 12 12v52c0 8-4 12-12 12H34c-8 0-12-4-12-12v-52c0-8 4-12 12-12z"
        />
        <rect x="36" y="168" width="14" height="18" rx="2" className={styles.window} />
        <rect x="54" y="168" width="10" height="28" rx="2" className={styles.door} />

        <path d="M74 56 L150 16 L226 56 Z" className={styles.roofShadow} />
        <ZonePath
          zone="roof"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.roof}
          d="M76 54 L150 18 L224 54 L210 54 L150 28 L90 54 Z"
        />
        <rect x="188" y="24" width="12" height="22" rx="2" className={styles.chimney} />

        <rect x="84" y="54" width="132" height="198" rx="8" className={styles.facade} />

        <ZoneRect
          zone="stairs"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.stairs}
          x={88}
          y={62}
          width={30}
          height={140}
          rx={6}
        />
        <ZoneRect
          zone="elevator"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.elevator}
          x={122}
          y={62}
          width={26}
          height={140}
          rx={6}
        />

        {[0, 1, 2, 3, 4].map((floor) => (
          <g key={floor}>
            <rect x="92" y={70 + floor * 26} width="10" height="12" rx="2" className={styles.stairWindow} />
            <rect x="104" y={70 + floor * 26} width="10" height="12" rx="2" className={styles.stairWindow} />
            <rect x="127" y={74 + floor * 26} width="16" height="14" rx="2" className={styles.liftDoor} />
            <rect x="158" y={70 + floor * 26} width="22" height="14" rx="2" className={styles.window} />
            <rect x="186" y={70 + floor * 26} width="22" height="14" rx="2" className={styles.window} />
          </g>
        ))}
        {zoneMoods.elevator === 'bad' ? (
          <g>
            <rect x="125" y="186" width="10" height="8" rx="1" className={styles.box} />
            <rect x="133" y="190" width="9" height="7" rx="1" className={styles.box} />
          </g>
        ) : null}

        <ZoneRect
          zone="lobby"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.lobby}
          x={88}
          y={204}
          width={124}
          height={44}
          rx={8}
        />
        <rect x="96" y="214" width="18" height="16" rx="2" className={styles.window} />
        <rect x="186" y="214" width="18" height="16" rx="2" className={styles.window} />

        <ZonePath
          zone="entrance"
          activeZone={activeZone}
          emergency={emergency}
          mood={zoneMoods.entrance}
          d="M132 214h36v34c0 4-4 8-8 8h-20c-4 0-8-4-8-8z"
        />
        <circle cx="160" cy="232" r="1.6" className={styles.knob} />
        {zoneMoods.entrance === 'bad' ? (
          <path d="M150 218 l14 6 v22 l-14 -5 z" className={styles.ajarDoor} />
        ) : null}

        {markerPos && marker ? (
          <g className={styles.marker} transform={`translate(${markerPos.x}, ${markerPos.y})`}>
            <circle r="13" className={`${styles.markerDisc} ${emergency ? styles.markerAlert : ''}`} />
            <text textAnchor="middle" dy="5" className={styles.markerText}>
              {marker}
            </text>
          </g>
        ) : null}

        {markerPos && emergency ? (
          <g transform={`translate(${markerPos.x + 16}, ${markerPos.y - 14})`}>
            <circle r="8" className={styles.alertDisc} />
          </g>
        ) : null}

        <text x="46" y="348" textAnchor="middle" className={styles.mapLabel}>
          Парковка
        </text>
        <text x="150" y="348" textAnchor="middle" className={styles.mapLabel}>
          Двор
        </text>
        <text x="254" y="348" textAnchor="middle" className={styles.mapLabel}>
          Контейнеры
        </text>
      </svg>

      <p className={styles.status}>
        {emergency ? <AlertTriangle size={14} aria-hidden="true" /> : null}
        {status}
      </p>
    </section>
  );
}

function ZoneRect({
  zone,
  activeZone,
  emergency,
  mood,
  x,
  y,
  width,
  height,
  rx = 6,
}: {
  zone: HouseZone;
  activeZone?: HouseZone | null;
  emergency: boolean;
  mood?: ZoneMood;
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}) {
  const active = zone === activeZone;

  return (
    <g
      className={zoneClass(active, emergency, mood)}
      filter={active ? (emergency ? 'url(#house-alert)' : 'url(#house-glow)') : undefined}
    >
      <title>{HOUSE_ZONE_LABELS[zone]}</title>
      <rect x={x} y={y} width={width} height={height} rx={rx} />
    </g>
  );
}

function ZonePath({
  zone,
  activeZone,
  emergency,
  mood,
  d,
}: {
  zone: HouseZone;
  activeZone?: HouseZone | null;
  emergency: boolean;
  mood?: ZoneMood;
  d: string;
}) {
  const active = zone === activeZone;

  return (
    <g
      className={zoneClass(active, emergency, mood)}
      filter={active ? (emergency ? 'url(#house-alert)' : 'url(#house-glow)') : undefined}
    >
      <title>{HOUSE_ZONE_LABELS[zone]}</title>
      <path d={d} />
    </g>
  );
}

function zoneClass(active: boolean, emergency: boolean, mood?: ZoneMood): string {
  const moodClass = mood === 'good' ? styles.zoneGood : mood === 'bad' ? styles.zoneBad : '';

  if (!active) {
    return `${styles.zone} ${moodClass}`.trim();
  }

  return `${styles.zone} ${styles.zoneActive} ${emergency ? styles.zoneAlert : ''} ${moodClass}`.trim();
}
