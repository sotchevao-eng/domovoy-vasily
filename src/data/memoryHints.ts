import type { GameAnswerHistory } from '../types/game';

export const MEMORY_HINTS: Record<string, string> = {
  'burnt-lamp:wait-for-round': 'Кстати, лампа на третьем этаже так и не загорелась. Лестница это помнит.',
  'burnt-lamp:use-flashlights': 'Вчера про фонарики шутили. Лестница шутить не стала.',
  'cctv-request:buy-immediately': 'Камеры вчера купили быстрее, чем успели всех спросить. Дом ещё переваривает.',
  'cctv-request:refuse-outright': 'Про камеры вчера сказали «нет» без разговора. Соседи это запомнили.',
  'old-furniture:leave-furniture': 'Шкаф у контейнеров, кажется, до сих пор ждёт пенсию. И друзей.',
  'old-furniture:move-across-yard': 'Мебель вчера просто переехала в другой угол двора. Двор не впечатлён.',
  'boxes-by-elevator:leave-boxes': 'Коробки у лифта вчера так и остались. Коридор уже почти считает их мебелью.',
  'water-leak:wait-until-tomorrow': 'Протечку вчера решили подождать. Вода, боюсь, не из тех, кто умеет ждать.',
  'broken-intercom:keep-open': 'Дверь вчера оставили слишком общительной. Подъезд это заметил.',
  'stranger-at-door:leave-door-open': 'Вчера вход держали открытым. Дом такие вечера помнит дольше, чем хотелось бы.',
  'blocked-driveway:ignore-car': 'Машина вчера перекрыла проезд, и двор до сих пор ворчит об этом.',
  'flower-bed:discuss-place': 'Клумбу вчера согласовали. У подъезда до сих пор пахнет хорошим решением.',
  'flower-bed:forbid-all': 'Инициативу с цветами вчера закрыли наглухо. Земля у подъезда обиделась молча.',
  'cleaning-complaint:ignore-cleaning': 'Площадку вчера так и не привели в порядок. Лестница помнит каждый шаг.',
  'stuck-elevator:keep-running': 'Лифт вчера оставили «ещё ездить». Он об этом не забыл.',
  'winter-icicles:wait-for-thaw': 'Сосульки вчера решили отдать оттепели. Крыльцо всё ещё поглядывает вверх.',
  'roof-after-rain:wait-next-rain': 'Пятно на потолке вчера оставили «на посмотреть». Крыша уже готовит продолжение.',
  'bike-in-lobby:leave-bike': 'Велосипед в холле вчера так и заночевал. Боюсь, он уже зовёт самокат.',
  'snow-not-cleared:wait-sun': 'Дорожку вчера оставили солнцу. Утро после такого бывает особенно скользким на словах.',
  'dryer-on-stairs:ignore-dryer': 'Сушилка на площадке вчера никуда не ушла. Лестница до сих пор чуть уже, чем хотелось бы.',
  'stray-cats-feeding:ignore-feeding': 'У контейнеров вчера оставили чужую столовую. Площадка просит договорённости, не миски в луже.',
  'protocol-missing:leave-empty-board': 'Протокол вчера так и не вернули на доску. Пустая рамка умеет громко молчать.',
  'meeting-quorum:decide-without': 'Вчера вопрос решили слишком узким кругом. Дом такие круги считает неполными.',
  'invoice-unclear:say-too-long': 'Смету вчера оставили «как есть». Жители всё ещё щурятся на формулировки.',
  'parking-marking:ignore-marking': 'Разметку вчера не тронули. Машины это восприняли как приглашение фантазировать.',
  'cat-in-basement:leave-food-there': 'В подвале вчера появилась миска. Трубы пока держатся, но кот уже как свой.',
  'mailboxes-broken:ignore-mailboxes': 'Ящик у входа вчера так и не закрыли. Почта сквозняков не любит.',
};

export function memoryKey(answer: Pick<GameAnswerHistory, 'eventId' | 'choiceId'>): string {
  return `${answer.eventId}:${answer.choiceId}`;
}
