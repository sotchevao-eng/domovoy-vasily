import { createContext, createElement, useContext, type ReactNode } from 'react';
import type { VKAppearance, VKLaunchInfo, VKUser } from './vkTypes';

export interface VKContextValue {
  isVK: boolean;
  isInitialized: boolean;
  outsideClient: boolean;
  user: VKUser | null;
  appearance: VKAppearance;
  platform: string;
  launchParams: VKLaunchInfo;
  canShare: boolean;
}

export const defaultVKContext: VKContextValue = {
  isVK: false,
  isInitialized: true,
  outsideClient: false,
  user: null,
  appearance: 'light',
  platform: 'unknown',
  launchParams: {},
  canShare: false,
};

export const VKContext = createContext<VKContextValue>(defaultVKContext);

export function useVK(): VKContextValue {
  return useContext(VKContext);
}

export function VKContextProvider({
  value,
  children,
}: {
  value: VKContextValue;
  children: ReactNode;
}) {
  return createElement(VKContext.Provider, { value }, children);
}
