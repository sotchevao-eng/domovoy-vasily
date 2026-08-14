import { useEffect, useState, type ReactNode } from 'react';
import { IS_VK_MODE, VK_APP_ID } from '../../config/appConfig';
import { applyViewSettings, initVK, subscribeToConfigUpdates } from './vkBridge';
import { defaultVKContext, VKContextProvider, type VKContextValue } from './useVK';
import type { VKAppearance } from './vkTypes';

const LOADER_MIN_MS = 200;

export function VKProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<VKContextValue>(() => ({
    ...defaultVKContext,
    isVK: IS_VK_MODE,
    isInitialized: !IS_VK_MODE,
  }));

  useEffect(() => {
    if (!IS_VK_MODE) {
      return;
    }

    document.documentElement.dataset.appMode = 'vk';

    let cancelled = false;
    const startedAt = Date.now();

    void initVK()
      .then(async (session) => {
        const wait = Math.max(0, LOADER_MIN_MS - (Date.now() - startedAt));
        if (wait > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, wait));
        }

        if (cancelled) {
          return;
        }

        const appearance: VKAppearance = session.appearance;
        document.documentElement.dataset.vkAppearance = appearance;
        document.documentElement.dataset.appMode = 'vk';

        setValue({
          isVK: true,
          isInitialized: true,
          outsideClient: session.outsideClient,
          user: session.user,
          appearance,
          platform: session.platform,
          launchParams: session.launchParams,
          canShare: session.canShare,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setValue({
          ...defaultVKContext,
          isVK: true,
          isInitialized: true,
          outsideClient: true,
        });
      });

    const unsubscribe = subscribeToConfigUpdates((appearance) => {
      setValue((current) => ({ ...current, appearance }));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!IS_VK_MODE || !value.isInitialized) {
      return;
    }

    void applyViewSettings(value.appearance);
  }, [value.appearance, value.isInitialized]);

  if (IS_VK_MODE && !value.isInitialized) {
    return (
      <div className="boot-screen" role="status">
        Василий открывает двери…
        {!VK_APP_ID && import.meta.env.DEV ? <p className="boot-note">VK App ID не настроен</p> : null}
      </div>
    );
  }

  return <VKContextProvider value={value}>{children}</VKContextProvider>;
}
