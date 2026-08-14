import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Что-то пошло не так</h1>
          <p>Кажется, Василий слишком активно наводил порядок. Попробуем ещё раз.</p>
          <div className={styles.actions}>
            <Button variant="primary" onClick={this.handleReload}>
              Перезагрузить
            </Button>
            <Button variant="secondary" to="/">
              На главную
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
