import type { AchievementCategory, AchievementDefinition } from '../types/game';

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  house: 'Дом',
  residents: 'Жители',
  decisions: 'Решения',
  rating: 'Рейтинг',
  experience: 'Опыт',
  secret: 'Секретные',
};

export const achievements: AchievementDefinition[] = [
  {
    id: 'first-day',
    title: 'Первый день',
    description: 'Завершить первую партию.',
    icon: 'trophy',
    category: 'experience',
  },
  {
    id: 'maintenance-master',
    title: 'Хозяин положения',
    description: 'Принять 5 хороших решений в технических ситуациях.',
    icon: 'wrench',
    category: 'house',
    vasilyText: 'Вот теперь я за трубы спокоен. Почти.',
  },
  {
    id: 'neighbors-favorite',
    title: 'Любимец соседей',
    description: 'Довести комфорт жителей до 90.',
    icon: 'heart',
    category: 'residents',
    vasilyText: 'Довольные соседи — явление редкое. Береги этот момент.',
  },
  {
    id: 'authority',
    title: 'Авторитет',
    description: 'Достичь репутации 90.',
    icon: 'star',
    category: 'residents',
    vasilyText: 'Кажется, тебя уже слушают. Только не привыкай слишком сильно.',
  },
  {
    id: 'thrifty-keeper',
    title: 'Экономный хранитель',
    description: 'Сохранить дом в хорошем состоянии и разумно распорядиться бюджетом.',
    icon: 'wallet',
    category: 'house',
  },
  {
    id: 'stay-calm',
    title: 'Спокойствие, только спокойствие',
    description: 'Правильно решить все аварийные ситуации за один день.',
    icon: 'shield',
    category: 'decisions',
  },
  {
    id: 'domovoy-approves',
    title: 'Домовой одобряет',
    description: 'Получить итоговый результат 90/100 или выше.',
    icon: 'home',
    category: 'rating',
    vasilyText: 'Ну всё. Ключи от кладовки я тебе почти доверяю.',
  },
  {
    id: 'tea-with-vasily',
    title: 'Чай с Василием',
    description: 'Не забыть о маленьких радостях даже в самый загруженный день.',
    icon: 'coffee',
    category: 'secret',
    hidden: true,
    vasilyText: 'Чай — тоже часть хорошего дня. Даже когда заявок больше, чем чашек.',
  },
  {
    id: 'house-lives',
    title: 'Дом живёт',
    description: 'Увидеть 5 разных маленьких историй дома.',
    icon: 'leaf',
    category: 'house',
    vasilyText: 'Маленькие истории тоже держат дом. Иногда даже крепче стен.',
  },
  {
    id: 'perfect-day',
    title: 'Идеальный день',
    description: 'Завершить день без единого неудачного решения.',
    icon: 'sparkles',
    category: 'decisions',
  },
  {
    id: 'no-panic',
    title: 'Без паники',
    description: 'Сделать минимум 5 хороших решений подряд.',
    icon: 'brain',
    category: 'decisions',
  },
  {
    id: 'house-in-order',
    title: 'Дом в порядке',
    description: 'Довести показатель состояния дома до 95 или выше.',
    icon: 'building',
    category: 'house',
  },
  {
    id: 'pro-growth',
    title: 'Профессиональный рост',
    description: 'Завершить 5 партий.',
    icon: 'growth',
    category: 'experience',
  },
  {
    id: 'precise-calc',
    title: 'Точный расчёт',
    description: 'Получить итоговый результат 98/100 или выше.',
    icon: 'target',
    category: 'rating',
  },
];

export const ACHIEVEMENTS_BY_ID = new Map(achievements.map((item) => [item.id, item]));

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS_BY_ID.get(id);
}

export function getAchievementProgressCount(unlockedIds: readonly string[]): {
  unlocked: number;
  total: number;
} {
  return {
    unlocked: unlockedIds.length,
    total: achievements.length,
  };
}
