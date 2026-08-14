import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { playSound } from '../services/soundService';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  to?: string;
  loading?: boolean;
  playClick?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'secondary',
    className,
    to,
    loading = false,
    disabled,
    playClick = true,
    onClick,
    type = 'button',
    ...props
  },
  ref,
) {
  const classes = [styles.button, styles[variant], loading ? styles.loading : '', className]
    .filter(Boolean)
    .join(' ');
  const isDisabled = disabled || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (playClick && !isDisabled) {
      playSound('button-click');
    }

    onClick?.(event);
  };

  if (to) {
    if (isDisabled) {
      return (
        <span className={classes} aria-disabled="true">
          {loading ? 'Подождите...' : children}
        </span>
      );
    }

    return (
      <Link
        to={to}
        className={classes}
        onClick={() => {
          if (playClick) {
            playSound('button-click');
          }
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={isDisabled} onClick={handleClick} {...props}>
      {loading ? 'Подождите...' : children}
    </button>
  );
});
