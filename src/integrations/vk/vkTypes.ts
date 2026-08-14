export interface VKUser {
  id: number;
  firstName: string;
  lastName?: string;
  photo?: string;
}

export type VKAppearance = 'light' | 'dark';

export interface VKLaunchInfo {
  platform?: string;
  appId?: number;
}

export interface VKShareSummary {
  score: number;
  rank: string;
}
