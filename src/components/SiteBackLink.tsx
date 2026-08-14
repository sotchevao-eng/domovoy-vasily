import { MAIN_SITE_URL, SHOW_MAIN_SITE_LINK } from '../config/appConfig';
import styles from './SiteBackLink.module.css';

interface SiteBackLinkProps {
  compact?: boolean;
  anywhere?: boolean;
}

export function SiteBackLink({ compact = false, anywhere = false }: SiteBackLinkProps) {
  if (!MAIN_SITE_URL) {
    return null;
  }

  if (!anywhere && !SHOW_MAIN_SITE_LINK) {
    return null;
  }

  return (
    <a className={compact ? styles.compact : styles.link} href={MAIN_SITE_URL}>
      ← На сайт ТСЖ
    </a>
  );
}
