import type { ChoiceRating, GameAnswerHistory, GameState, HouseZone } from '../types/game';
import { findEventById } from './events';
import { findSpecialEventById } from './specialEvents';

export type ZoneMood = 'good' | 'neutral' | 'bad';

export type ZoneMoodMap = Partial<Record<HouseZone, ZoneMood>>;

const MOOD_SCORE: Record<ChoiceRating, number> = {
  good: 1,
  neutral: 0,
  bad: -1,
};

export function getZoneMoods(state: Pick<GameState, 'answers' | 'specialAnswers'>): ZoneMoodMap {
  const scores: Partial<Record<HouseZone, number>> = {};
  const answers = [...(state.answers ?? []), ...(state.specialAnswers ?? [])];

  for (const answer of answers) {
    const zone = getAnswerZone(answer);

    if (!zone) {
      continue;
    }

    scores[zone] = (scores[zone] ?? 0) + MOOD_SCORE[answer.rating];
  }

  const moods: ZoneMoodMap = {};

  for (const [zone, score] of Object.entries(scores) as [HouseZone, number][]) {
    if (score > 0) {
      moods[zone] = 'good';
    } else if (score < 0) {
      moods[zone] = 'bad';
    } else {
      moods[zone] = 'neutral';
    }
  }

  return moods;
}

function getAnswerZone(answer: GameAnswerHistory): HouseZone | undefined {
  return findEventById(answer.eventId)?.zone ?? findSpecialEventById(answer.eventId)?.zone;
}
