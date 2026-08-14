import { vasilyMain } from '../assets/vasily';
import styles from './Vasily.module.css';

export type VasilyPose = 'wait' | 'praise' | 'grumble';

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
  const poseClass =
    pose === 'praise' ? styles.posePraise : pose === 'grumble' ? styles.poseGrumble : styles.poseWait;

  return (
    <figure className={`${styles.figure} ${styles[size]} ${poseClass} ${reduceMotion ? styles.static : ''}`}>
      <div className={styles.glow} aria-hidden="true" />
      <img src={vasilyMain} alt="Домовой Василий" className={styles.image} />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
