import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Car,
  FileText,
  Flower2,
  Megaphone,
  PawPrint,
  Shield,
  Sparkles,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { EventCategory } from '../types/game';

export const EVENT_CATEGORY_META: Record<EventCategory, { label: string; icon: LucideIcon }> = {
  maintenance: { label: 'Техническая проблема', icon: Wrench },
  emergency: { label: 'Авария', icon: AlertTriangle },
  cleaning: { label: 'Уборка', icon: Sparkles },
  yard: { label: 'Двор', icon: Flower2 },
  parking: { label: 'Парковка', icon: Car },
  animals: { label: 'Животные', icon: PawPrint },
  finance: { label: 'Финансы', icon: Wallet },
  neighbors: { label: 'Соседи', icon: Users },
  meeting: { label: 'Собрание', icon: Megaphone },
  documents: { label: 'Документы', icon: FileText },
  security: { label: 'Безопасность', icon: Shield },
};
