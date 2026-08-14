import type { VKShareSummary } from './vkTypes';

export function getShareText(daySummary: VKShareSummary): string {
  return `Я получил ${daySummary.score}/100 в игре «Домовой Василий: Хранитель дома» и стал ${daySummary.rank} 🏡`;
}
