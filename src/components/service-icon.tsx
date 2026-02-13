/* eslint-disable react-refresh/only-export-components -- getServiceColor + ICON_MAP shared with other components */
import type { StyleProp, ViewStyle } from 'react-native';

import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

const ICON_MAP: Record<string, { symbol: string; color: string }> = {
  youtube: { symbol: 'play.rectangle', color: '#FF0000' },
  spotify: { symbol: 'music.note', color: '#1DB954' },
  netflix: { symbol: 'film', color: '#E50914' },
  linkedin: { symbol: 'person.crop.square', color: '#0A66C2' },
  cursor: { symbol: 'terminal', color: '#8E8E93' },
  claude: { symbol: 'sparkles', color: '#FF8A3D' },
  chatgpt: { symbol: 'circle.grid.2x2', color: '#10A37F' },
  icloud: { symbol: 'icloud', color: '#5AC8FA' },
  disney: { symbol: 'sparkles', color: '#113CCF' },
  hbo: { symbol: 'film', color: '#B81D24' },
  amazon: { symbol: 'bag', color: '#FF9900' },
  apple_tv: { symbol: 'play.tv', color: '#000000' },
  hulu: { symbol: 'play.rectangle', color: '#1CE783' },
  paramount: { symbol: 'mountain.2', color: '#0064FF' },
  peacock: { symbol: 'bird', color: '#000000' },
  apple_music: { symbol: 'music.note', color: '#FA243C' },
  youtube_premium: { symbol: 'play.rectangle.fill', color: '#FF0000' },
  tidal: { symbol: 'waveform', color: '#000000' },
  deezer: { symbol: 'music.note.list', color: '#FEAA2D' },
  soundcloud: { symbol: 'cloud', color: '#FF5500' },
  twitch: { symbol: 'play.circle', color: '#9146FF' },
  notion: { symbol: 'doc.text', color: '#000000' },
  slack: { symbol: 'bubble.left.and.bubble.right', color: '#4A154B' },
  zoom: { symbol: 'video', color: '#0B5CFF' },
  microsoft_365: { symbol: 'square.grid.3x3', color: '#00A4EF' },
  google_one: { symbol: 'person.crop.circle', color: '#4285F4' },
  dropbox: { symbol: 'folder', color: '#0061FF' },
  adobe: { symbol: 'paintbrush', color: '#FF0000' },
  figma: { symbol: 'square.dashed', color: '#F24E1E' },
  canva: { symbol: 'paintpalette', color: '#00C4CC' },
  evernote: { symbol: 'elephant', color: '#00A82D' },
  github_copilot: { symbol: 'chevron.left.forward', color: '#000000' },
  midjourney: { symbol: 'wand.and.stars', color: '#1A1A2E' },
  twitter: { symbol: 'bird', color: '#1DA1F2' },
  facebook: { symbol: 'person.2', color: '#1877F2' },
  instagram: { symbol: 'camera', color: '#E4405F' },
  xbox: { symbol: 'gamecontroller', color: '#107C10' },
  playstation: { symbol: 'gamecontroller', color: '#003791' },
  nintendo: { symbol: 'gamecontroller', color: '#E60012' },
  ea_play: { symbol: 'gamecontroller', color: '#E31E24' },
  nyt: { symbol: 'newspaper', color: '#DDDDDD' },
  wsj: { symbol: 'newspaper', color: '#000000' },
  duolingo: { symbol: 'bird', color: '#58CC02' },
  headspace: { symbol: 'brain.head.profile', color: '#F47B57' },
  calm: { symbol: 'leaf', color: '#4A90E2' },
  audible: { symbol: 'headphones', color: '#F8991D' },
  kindle: { symbol: 'book', color: '#FF9900' },
  lastpass: { symbol: 'key', color: '#D32F2F' },
  onepassword: { symbol: 'lock.shield', color: '#0092F4' },
  nordvpn: { symbol: 'network', color: '#4687FF' },
  expressvpn: { symbol: 'network', color: '#DA3940' },
  discord: { symbol: 'bubble.left.and.bubble.right', color: '#5865F2' },
  telegram: { symbol: 'paperplane', color: '#26A5E4' },
  substack: { symbol: 'envelope', color: '#FF6719' },
  patreon: { symbol: 'heart', color: '#FF424D' },
  medium: { symbol: 'book', color: '#000000' },
  adobe_cc: { symbol: 'paintbrush.pointed', color: '#FF0000' },
  custom: { symbol: 'sparkles', color: '#FF8A3D' },
};

export function getServiceColor(iconKey?: string) {
  return (ICON_MAP[iconKey ?? 'custom'] ?? ICON_MAP.custom).color;
}

type ServiceIconProps = {
  iconKey?: string;
  /** When set, shows this image URL (e.g. Brandfetch logo) instead of built-in icon. */
  iconUri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ServiceIcon({ iconKey = 'custom', iconUri, size = 48, style }: ServiceIconProps) {
  const { colors, isDark } = useTheme();
  const config = ICON_MAP[iconKey] ?? ICON_MAP.custom;
  const iconSize = Math.round(size * 0.52);
  const useImage = Boolean(iconUri?.trim());

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderCurve: 'continuous',
          backgroundColor: useImage ? (isDark ? 'rgba(58, 58, 60, 0.8)' : 'rgba(255,255,255,0.9)') : config.color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 10px 20px rgba(0, 0, 0, 0.35)'
            : '0 10px 16px rgba(15, 23, 42, 0.18)',
        },
        style,
      ]}
    >
      {useImage
        ? (
            <Image
              source={{ uri: iconUri! }}
              style={{ width: size, height: size }}
              contentFit="cover"
            />
          )
        : (
            <Image
              source={`sf:${config.symbol}`}
              style={{ width: iconSize, height: iconSize }}
              tintColor={colors.iconOnColor}
            />
          )}
    </View>
  );
}
