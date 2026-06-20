import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Brain,
  Calendar,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  Gift,
  GraduationCap,
  LayoutDashboard,
  LayoutList,
  LineChart,
  Mail,
  MapPin,
  Medal,
  MessageCircle,
  Music,
  Palette,
  PieChart,
  Repeat,
  Settings,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  Users,
  Video,
  Zap,
  Crosshair,
  Eye,
  ExternalLink,
  ClipboardPen,
  GitCompare,
  Flame,
  ListOrdered,
  HelpCircle,
  NotebookPen,
} from 'lucide-react';

/** Strip emoji / pictographs from section titles for display and lookup. */
export function cleanSectionTitle(title) {
  return String(title || '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sectionIconKey(title) {
  return cleanSectionTitle(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const SECTION_ICONS = {
  'dralo-ia-experience': Sparkles,
  'general-statistics': ClipboardList,
  'exam-statistics': FileText,
  'study-activity': Calendar,
  'practice-times': Timer,
  'skills-analysis': Target,
  'skills-radar': Crosshair,
  'score-history': LineChart,
  'distribution-by-level': PieChart,
  'achievements-badges': Trophy,
  'my-goals': Target,
  'progress-dashboard': LayoutDashboard,
  'adaptive-learning': Brain,
  'performance-metrics': Gauge,
  'recent-achievements': Award,
  'your-account': User,
  'my-subscription': CreditCard,
  'personal-details': ClipboardPen,
  'security': Shield,
  'delete-account': Trash2,
  'notifications': Bell,
  'invite-friends': Mail,
  'study-timer': Timer,
  'favourite-exercises': Star,
  'study-history': BookOpen,
  'progress-comparison': GitCompare,
  'study-groups': Users,
  'weekly-challenges': Trophy,
  'smart-recommendations': Sparkles,
  'achievement-progress': Medal,
  'advanced-statistics': BarChart3,
  'ai-insights': Bot,
  'smart-study-plan': CalendarDays,
  'study-music': Music,
  'study-calendar': Calendar,
  'my-study-goals': Target,
  'study-habits': Repeat,
  'detailed-progress': TrendingUp,
  'rewards-system': Gift,
  'special-challenges': Zap,
  'leaderboard': ListOrdered,
  'motivation': Flame,
  'group-chat': MessageCircle,
  'visual-themes': Palette,
  'when-should-you-take-the-exam': GraduationCap,
  'dates-by-city': MapPin,
  'official-resources': ExternalLink,
  'exam-readiness': CalendarDays,
  'error-tracker': Brain,
  'private-tutor': GraduationCap,
  'find-your-private-tutor': GraduationCap,
  'tutoring-settings': Settings,
  'profile-preview': Eye,
  'available-teachers': Users,
  'online-lessons': Video,
  'in-person-lessons': MapPin,
  'how-it-works': HelpCircle,
  'my-study-notes': NotebookPen,
  'mis-notas-de-estudio': NotebookPen,
};

export function getProfileSectionIcon(title) {
  const key = sectionIconKey(title);
  return SECTION_ICONS[key] || LayoutList;
}
