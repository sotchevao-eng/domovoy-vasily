import { Home, Trophy } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { IS_WEBSITE_MODE, ROUTES, SHOW_MAIN_SITE_LINK } from '../config/appConfig';
import { SiteBackLink } from './SiteBackLink';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Домовой Василий' }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brandBlock}>
        <Link to={ROUTES.home} className={styles.brand} aria-label="На главную">
          <span className={styles.mark} aria-hidden="true">
            <Home size={18} strokeWidth={2.2} />
          </span>
          <span className={styles.brandText}>
            <span className={styles.kicker}>Хранитель дома</span>
            <strong>{title}</strong>
          </span>
        </Link>
        {IS_WEBSITE_MODE ? <p className={styles.siteLabel}>Игра ТСЖ «Васильевский»</p> : null}
        {SHOW_MAIN_SITE_LINK ? (
          <div className={styles.siteBack}>
            <SiteBackLink compact />
          </div>
        ) : null}
      </div>

      <nav className={styles.nav} aria-label="Разделы игры">
        <NavLink to={ROUTES.achievements} className={styles.navLink}>
          <Trophy size={16} />
          <span>Достижения</span>
        </NavLink>
        <NavLink to={ROUTES.howToPlay} className={styles.navLink}>
          Как играть
        </NavLink>
        <NavLink to={ROUTES.settings} className={styles.navLink}>
          Настройки
        </NavLink>
      </nav>
    </header>
  );
}
