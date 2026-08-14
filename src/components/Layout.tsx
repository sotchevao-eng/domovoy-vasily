import type { ReactNode } from 'react';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className={styles.shell}>
      <Header title={title} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
