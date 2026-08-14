import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './ChoiceButton.module.css';

type ChoiceButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  to?: string;
  selected?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ChoiceButton({
  children,
  variant = 'secondary',
  className,
  to,
  selected = false,
  ...props
}: ChoiceButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    selected ? styles.selected : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
