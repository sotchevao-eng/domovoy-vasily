import {
  Brain,
  Building2,
  Coffee,
  Heart,
  Home,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Wrench,
  Leaf,
} from 'lucide-react';
import type { AchievementIcon as AchievementIconName } from '../types/game';

const ICONS = {
  trophy: Trophy,
  wrench: Wrench,
  heart: Heart,
  star: Star,
  wallet: Wallet,
  shield: Shield,
  home: Home,
  coffee: Coffee,
  sparkles: Sparkles,
  brain: Brain,
  building: Building2,
  growth: TrendingUp,
  target: Target,
  leaf: Leaf,
} as const;

export function AchievementIcon({
  name,
  size = 22,
}: {
  name: AchievementIconName;
  size?: number;
}) {
  const Icon = ICONS[name] ?? Trophy;
  return <Icon size={size} />;
}
