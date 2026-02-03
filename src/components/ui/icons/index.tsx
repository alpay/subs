import type { LucideProps } from 'lucide-react-native';
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Github as GithubIcon,
  Globe,
  GraduationCap,
  HeartHandshake,
  Home as HomeIcon,
  Languages,
  Package,
  Palette,
  Settings as SettingsIcon,
  Share2,
  Star,
  Stethoscope,
  Trash2,
} from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import colors from '@/components/ui/colors';
import { useTheme } from '@/lib/hooks/use-theme';

type IconProps = LucideProps & { color?: string };

export function ArrowRight({ color = '#CCC', style, size = 16, ...props }: IconProps) {
  return (
    <ChevronRight
      color={color}
      size={size}
      {...props}
      style={StyleSheet.flatten([style])}
    />
  );
}

export function CaretDown({ color, size = 16, ...props }: IconProps) {
  const { colors: themeColors } = useTheme();
  const resolved = color ?? themeColors.text;
  return <ChevronDown color={resolved} size={size} {...props} />;
}

export function DiaryIcon({ color = '#6B7280', size = 24, ...props }: IconProps) {
  return <BookOpen color={color} size={size} {...props} />;
}

export function Github({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <GithubIcon color={color} size={size} {...props} />;
}

export function Home({ color = '#000', size = 24, ...props }: IconProps) {
  return <HomeIcon color={color} size={size} {...props} />;
}

export function Language({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <Languages color={color} size={size} {...props} />;
}

export function LearnIcon({ color = '#6B7280', size = 24, ...props }: IconProps) {
  return <GraduationCap color={color} size={size} {...props} />;
}

export function ProductsIcon({ color = '#6B7280', size = 24, ...props }: IconProps) {
  return <Package color={color} size={size} {...props} />;
}

export function Rate({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <Star color={color} size={size} {...props} />;
}

export function Settings({ color = '#000', size = 24, ...props }: IconProps) {
  return <SettingsIcon color={color} size={size} {...props} />;
}

export function Share({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <Share2 color={color} size={size} {...props} />;
}

export function Style({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <Palette color={color} size={size} {...props} />;
}

export function Support({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <HeartHandshake color={color} size={size} {...props} />;
}

export function TodayIcon({ color = '#6B7280', size = 24, ...props }: IconProps) {
  return <CalendarDays color={color} size={size} {...props} />;
}

export function TreatmentsIcon({ color = '#6B7280', size = 24, ...props }: IconProps) {
  return <Stethoscope color={color} size={size} {...props} />;
}

export function Trash({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <Trash2 color={color} size={size} {...props} />;
}

export function Website({ color = colors.neutral[500], size = 24, ...props }: IconProps) {
  return <Globe color={color} size={size} {...props} />;
}
