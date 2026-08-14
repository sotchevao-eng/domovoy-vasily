import vasilyWait from './vasily-wait.png';
import vasilyPraise from './vasily-praise.png';
import vasilyGrumble from './vasily-grumble.png';
import vasilyTired from './vasily-tired.png';
import vasilyThink from './vasily-think.png';
import vasilyWorry from './vasily-worry.png';
import vasilyCelebrate from './vasily-celebrate.png';
import vasilyExplain from './vasily-explain.png';

export type VasilyPose =
  | 'wait'
  | 'praise'
  | 'grumble'
  | 'tired'
  | 'think'
  | 'worry'
  | 'celebrate'
  | 'explain';

export const vasilyPoses: Record<VasilyPose, string> = {
  wait: vasilyWait,
  praise: vasilyPraise,
  grumble: vasilyGrumble,
  tired: vasilyTired,
  think: vasilyThink,
  worry: vasilyWorry,
  celebrate: vasilyCelebrate,
  explain: vasilyExplain,
};

export const vasilyMain = vasilyWait;

export { vasilyWait, vasilyPraise, vasilyGrumble, vasilyTired, vasilyThink, vasilyWorry, vasilyCelebrate, vasilyExplain };
export default vasilyWait;
