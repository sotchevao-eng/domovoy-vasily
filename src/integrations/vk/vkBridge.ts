import bridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge';
import type { VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge';
import { IS_VK_MODE, VK_APP_ID } from '../../config/appConfig';
import { logVKError } from './vkErrorHandler';
import type { VKAppearance, VKLaunchInfo, VKShareSummary, VKUser } from './vkTypes';

const GAME_STATUS_BAR_COLOR = '#f6efe3';
const INIT_TIMEOUT_MS = 2500;

export interface VKBridgeSession {
  initialized: boolean;
  outsideClient: boolean;
  user: VKUser | null;
  appearance: VKAppearance;
  platform: string;
  launchParams: VKLaunchInfo;
  canShare: boolean;
}

const emptySession = (): VKBridgeSession => ({
  initialized: false,
  outsideClient: false,
  user: null,
  appearance: 'light',
  platform: 'unknown',
  launchParams: {},
  canShare: false,
});

export async function initVK(): Promise<VKBridgeSession> {
  const session = emptySession();
  session.launchParams = readLaunchParams();
  session.platform = session.launchParams.platform ?? detectPlatform();

  if (!IS_VK_MODE) {
    return session;
  }

  if (import.meta.env.DEV) {
    console.info('VK mode enabled');
  }

  try {
    await withTimeout(bridge.send('VKWebAppInit', {}), INIT_TIMEOUT_MS);
    session.initialized = true;
    session.outsideClient = !bridge.isWebView() && !bridge.isIframe() && !bridge.isEmbedded();
    if (import.meta.env.DEV) {
      console.info('VK Bridge initialized', {
        outsideClient: session.outsideClient,
        appId: VK_APP_ID || 'not set',
      });
    }
  } catch (error) {
    logVKError('init', error);
    session.initialized = true;
    session.outsideClient = true;
    return session;
  }

  session.user = await fetchVKUser();
  session.canShare = canUseMethod('VKWebAppShare');
  await applyViewSettings(session.appearance);

  return session;
}

export function subscribeToConfigUpdates(onUpdate?: (appearance: VKAppearance) => void) {
  if (!IS_VK_MODE) {
    return () => undefined;
  }

  const listener: VKBridgeSubscribeHandler = (event) => {
    if (event.detail.type !== 'VKWebAppUpdateConfig') {
      return;
    }

    const data = event.detail.data as { appearance?: VKAppearance };
    const appearance = data.appearance === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.vkAppearance = appearance;
    void applyViewSettings(appearance);
    onUpdate?.(appearance);
  };

  bridge.subscribe(listener);
  return () => bridge.unsubscribe(listener);
}

export async function applyViewSettings(appearance: VKAppearance) {
  if (!IS_VK_MODE || !canUseMethod('VKWebAppSetViewSettings')) {
    return;
  }

  try {
    await bridge.send('VKWebAppSetViewSettings', {
      status_bar_style: appearance === 'dark' ? 'light' : 'dark',
      action_bar_color: GAME_STATUS_BAR_COLOR,
      navigation_bar_color: GAME_STATUS_BAR_COLOR,
    });
  } catch (error) {
    logVKError('view-settings', error);
  }
}

export async function syncVKBackBehavior(isHome: boolean) {
  if (!IS_VK_MODE) {
    return;
  }

  try {
    if (canUseMethod('VKWebAppSetSwipeSettings')) {
      await bridge.send('VKWebAppSetSwipeSettings', { history: isHome });
      return;
    }

    if (isHome && canUseMethod('VKWebAppEnableSwipeBack')) {
      await bridge.send('VKWebAppEnableSwipeBack', {});
      return;
    }

    if (!isHome && canUseMethod('VKWebAppDisableSwipeBack')) {
      await bridge.send('VKWebAppDisableSwipeBack', {});
    }
  } catch (error) {
    logVKError('back-behavior', error);
  }
}

export function notifyVKHaptic(kind: 'success' | 'warning' = 'success') {
  if (!IS_VK_MODE || !canUseMethod('VKWebAppTapticNotificationOccurred')) {
    return;
  }

  void bridge.send('VKWebAppTapticNotificationOccurred', { type: kind }).catch((error) => {
    logVKError('haptic', error);
  });
}

export async function shareVKResult(_summary: VKShareSummary) {
  if (!IS_VK_MODE || !canUseMethod('VKWebAppShare')) {
    return false;
  }

  try {
    const payload = VK_APP_ID ? { link: `https://vk.com/app${VK_APP_ID}` } : {};
    await bridge.send('VKWebAppShare', payload);
    return true;
  } catch (error) {
    logVKError('share', error);
    return false;
  }
}

export function canUseMethod(method: Parameters<typeof bridge.supports>[0]): boolean {
  try {
    return IS_VK_MODE && bridge.supports(method);
  } catch {
    return false;
  }
}

function readLaunchParams(): VKLaunchInfo {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const parsed = parseURLSearchParamsForGetLaunchParams(window.location.search);
    return {
      platform: parsed.vk_platform,
      appId: parsed.vk_app_id,
    };
  } catch (error) {
    logVKError('launch-params', error);
    return {};
  }
}

async function fetchVKUser(): Promise<VKUser | null> {
  if (!canUseMethod('VKWebAppGetUserInfo')) {
    return null;
  }

  try {
    const data = await withTimeout(bridge.send('VKWebAppGetUserInfo', {}), 1500);
    if (!data.id || !data.first_name) {
      return null;
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      photo: data.photo_100 || data.photo_200,
    };
  } catch (error) {
    logVKError('user-info', error);
    return null;
  }
}

function detectPlatform(): string {
  try {
    if (bridge.isWebView()) {
      return 'mobile_webview';
    }

    if (bridge.isIframe() || bridge.isEmbedded()) {
      return 'iframe';
    }
  } catch {
    // Bridge helpers may be unavailable outside VK.
  }

  return 'unknown';
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('timeout'));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}
