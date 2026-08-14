export function normalizeViteBase(value?: string): string {
  const trimmed = value?.trim() || '/';

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

export function normalizeRouterBasename(value?: string): string {
  const base = normalizeViteBase(value);

  if (base === '/') {
    return '/';
  }

  return base.endsWith('/') ? base.slice(0, -1) : base;
}
