import { vasilyPoses, type VasilyPose } from '../assets/vasily';
import styles from './Vasily.module.css';

export type { VasilyPose };

interface VasilyProps {
  caption?: string;
  size?: 'sm' | 'md' | 'lg';
  pose?: VasilyPose;
  reduceMotion?: boolean;
}

export function Vasily({
  caption = 'Василий уже дома и ждёт вас.',
  size = 'md',
  pose = 'wait',
  reduceMotion = false,
}: VasilyProps) {
  return (
    <figure className={`${styles.figure} ${styles[size]} ${reduceMotion ? styles.static : ''}`}>
      <div className={styles.glow} aria-hidden="true" />
      <img src={vasilyPoses[pose]} alt="Домовой Василий" className={styles.image} />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
