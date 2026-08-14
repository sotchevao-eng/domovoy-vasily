import { normalizeRouterBasename, normalizeViteBase } from './paths';

export type AppMode = 'standalone' | 'website' | 'vk';

export const APP_MODE = getAppMode();
export const BASE_PATH = normalizeViteBase(import.meta.env.VITE_BASE_PATH);
export const ROUTER_BASENAME = normalizeRouterBasename(import.meta.env.VITE_BASE_PATH);
export const MAIN_SITE_URL = getMainSiteUrl();
export const OG_IMAGE_URL = getOptionalHttpsUrl(import.meta.env.VITE_OG_IMAGE_URL);
export const VK_APP_ID = import.meta.env.VITE_VK_APP_ID?.trim() ?? '';
export const IS_WEBSITE_MODE = APP_MODE === 'website';
export const IS_VK_MODE = APP_MODE === 'vk';
export const isVKMode = IS_VK_MODE;
export const SHOW_MAIN_SITE_LINK = IS_WEBSITE_MODE && Boolean(MAIN_SITE_URL);

export const APP_TITLE = IS_WEBSITE_MODE
  ? 'Домовой Василий: Хранитель дома — ТСЖ «Васильевский»'
  : 'Домовой Василий: Хранитель дома';

export const APP_DESCRIPTION =
  'Интерактивная игра ТСЖ «Васильевский»: помогите домовому Василию заботиться о доме и принимать решения.';

export const ROUTES = {
  home: '/',
  intro: '/intro',
  play: '/play',
  result: '/result',
  achievements: '/achievements',
  howToPlay: '/how-to-play',
  settings: '/settings',
} as const;

export function getAppMode(): AppMode {
  const value = import.meta.env.VITE_APP_MODE;

  if (value === 'website' || value === 'vk') {
    return value;
  }

  return 'standalone';
}

export function getBasePath(): string {
  return ROUTER_BASENAME;
}

export function getMainSiteUrl(): string | null {
  return getOptionalHttpUrl(import.meta.env.VITE_MAIN_SITE_URL);
}

function getOptionalHttpUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getOptionalHttpsUrl(value: string | undefined): string | null {
  const url = getOptionalHttpUrl(value);
  return url?.startsWith('https:') ? url : null;
}
