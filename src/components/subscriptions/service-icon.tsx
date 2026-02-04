import { Bot, Cloud, Film, Globe, Linkedin, MousePointerClick, Music, Play } from 'lucide-react-native';

import { useTheme } from '@/lib/hooks/use-theme';

export type ServiceIconProps = {
  iconKey: string;
  size?: number;
};

export default function ServiceIcon({ iconKey, size = 22 }: ServiceIconProps) {
  const { colors } = useTheme();
  const color = colors.text;

  switch (iconKey) {
    case 'youtube':
      return <Play size={size} color={color} />;
    case 'spotify':
      return <Music size={size} color={color} />;
    case 'netflix':
      return <Film size={size} color={color} />;
    case 'linkedin':
      return <Linkedin size={size} color={color} />;
    case 'cursor':
      return <MousePointerClick size={size} color={color} />;
    case 'claude':
      return <Bot size={size} color={color} />;
    case 'chatgpt':
      return <Bot size={size} color={color} />;
    case 'icloud':
      return <Cloud size={size} color={color} />;
    default:
      return <Globe size={size} color={color} />;
  }
}
