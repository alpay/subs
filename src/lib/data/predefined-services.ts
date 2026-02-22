/**
 * Static predefined services for the Services screen.
 * iconKey must match a key in SIMPLE_ICON_DATA (src/lib/data/simple-icons-paths.ts).
 * Order: top 4 = most common, then streaming → social → productivity → lifestyle → dev tools last.
 */
export const PREDEFINED_SERVICES = [
  // First 4: most common for real people
  { id: 'youtube', name: 'YouTube', iconKey: 'youtube' },
  { id: 'spotify', name: 'Spotify', iconKey: 'spotify' },
  { id: 'netflix', name: 'Netflix', iconKey: 'netflix' },
  { id: 'icloud', name: 'Apple iCloud', iconKey: 'icloud' },

  // Streaming & entertainment
  { id: 'youtube_premium', name: 'YouTube Premium', iconKey: 'youtube_premium' },
  { id: 'youtubemusic', name: 'YouTube Music', iconKey: 'youtubemusic' },
  { id: 'youtubetv', name: 'YouTube TV', iconKey: 'youtubetv' },
  { id: 'apple_tv', name: 'Apple TV+', iconKey: 'apple_tv' },
  { id: 'apple_music', name: 'Apple Music', iconKey: 'apple_music' },
  { id: 'hbo', name: 'HBO Max', iconKey: 'hbo' },
  { id: 'max', name: 'Max', iconKey: 'max' },
  { id: 'paramount', name: 'Paramount+', iconKey: 'paramount' },
  { id: 'crunchyroll', name: 'Crunchyroll', iconKey: 'crunchyroll' },
  { id: 'plex', name: 'Plex', iconKey: 'plex' },
  { id: 'tidal', name: 'Tidal', iconKey: 'tidal' },
  { id: 'deezer', name: 'Deezer', iconKey: 'deezer' },
  { id: 'soundcloud', name: 'SoundCloud', iconKey: 'soundcloud' },
  { id: 'pandora', name: 'Pandora', iconKey: 'pandora' },
  { id: 'twitch', name: 'Twitch', iconKey: 'twitch' },
  { id: 'vimeo', name: 'Vimeo', iconKey: 'vimeo' },

  // Social & messaging
  { id: 'instagram', name: 'Instagram', iconKey: 'instagram' },
  { id: 'facebook', name: 'Facebook', iconKey: 'facebook' },
  { id: 'twitter', name: 'X (Twitter)', iconKey: 'twitter' },
  { id: 'tiktok', name: 'TikTok', iconKey: 'tiktok' },
  { id: 'reddit', name: 'Reddit', iconKey: 'reddit' },
  { id: 'discord', name: 'Discord Nitro', iconKey: 'discord' },
  { id: 'whatsapp', name: 'WhatsApp', iconKey: 'whatsapp' },
  { id: 'telegram', name: 'Telegram Premium', iconKey: 'telegram' },
  { id: 'snapchat', name: 'Snapchat', iconKey: 'snapchat' },
  { id: 'pinterest', name: 'Pinterest', iconKey: 'pinterest' },

  // Productivity & storage (everyday users)
  { id: 'notion', name: 'Notion', iconKey: 'notion' },
  { id: 'zoom', name: 'Zoom', iconKey: 'zoom' },
  { id: 'google_one', name: 'Google One', iconKey: 'google_one' },
  { id: 'googledrive', name: 'Google Drive', iconKey: 'googledrive' },
  { id: 'googlemeet', name: 'Google Meet', iconKey: 'googlemeet' },
  { id: 'dropbox', name: 'Dropbox', iconKey: 'dropbox' },
  { id: 'evernote', name: 'Evernote', iconKey: 'evernote' },

  // Travel & lifestyle
  { id: 'uber', name: 'Uber', iconKey: 'uber' },
  { id: 'lyft', name: 'Lyft', iconKey: 'lyft' },
  { id: 'airbnb', name: 'Airbnb', iconKey: 'airbnb' },
  { id: 'expedia', name: 'Expedia', iconKey: 'expedia' },

  // Finance & shopping
  { id: 'paypal', name: 'PayPal', iconKey: 'paypal' },
  { id: 'apple', name: 'Apple', iconKey: 'apple' },
  { id: 'shopify', name: 'Shopify', iconKey: 'shopify' },

  // Learning & wellness
  { id: 'duolingo', name: 'Duolingo', iconKey: 'duolingo' },
  { id: 'headspace', name: 'Headspace', iconKey: 'headspace' },
  { id: 'peloton', name: 'Peloton', iconKey: 'peloton' },
  { id: 'audible', name: 'Audible', iconKey: 'audible' },
  { id: 'coursera', name: 'Coursera', iconKey: 'coursera' },
  { id: 'udemy', name: 'Udemy', iconKey: 'udemy' },
  { id: 'skillshare', name: 'Skillshare', iconKey: 'skillshare' },
  { id: 'khanacademy', name: 'Khan Academy', iconKey: 'khanacademy' },
  { id: 'nyt', name: 'The New York Times', iconKey: 'nyt' },
  { id: 'substack', name: 'Substack', iconKey: 'substack' },
  { id: 'medium', name: 'Medium', iconKey: 'medium' },
  { id: 'patreon', name: 'Patreon', iconKey: 'patreon' },

  // Password managers & VPNs
  { id: 'onepassword', name: '1Password', iconKey: 'onepassword' },
  { id: 'lastpass', name: 'LastPass', iconKey: 'lastpass' },
  { id: 'bitwarden', name: 'Bitwarden', iconKey: 'bitwarden' },
  { id: 'nordvpn', name: 'NordVPN', iconKey: 'nordvpn' },
  { id: 'expressvpn', name: 'ExpressVPN', iconKey: 'expressvpn' },
  { id: 'protonvpn', name: 'Proton VPN', iconKey: 'protonvpn' },
  { id: 'surfshark', name: 'Surfshark', iconKey: 'surfshark' },

  // Gaming
  { id: 'playstation', name: 'PlayStation Plus', iconKey: 'playstation' },
  { id: 'ea_play', name: 'EA Play', iconKey: 'ea_play' },
  { id: 'epicgames', name: 'Epic Games', iconKey: 'epicgames' },
  { id: 'steam', name: 'Steam', iconKey: 'steam' },
  { id: 'ubisoft', name: 'Ubisoft', iconKey: 'ubisoft' },

  // Developer & pro tools (last)
  { id: 'cursor', name: 'Cursor', iconKey: 'cursor' },
  { id: 'claude', name: 'Claude', iconKey: 'claude' },
  { id: 'github_copilot', name: 'GitHub Copilot', iconKey: 'github_copilot' },
  { id: 'github', name: 'GitHub', iconKey: 'github' },
  { id: 'figma', name: 'Figma', iconKey: 'figma' },
  { id: 'trello', name: 'Trello', iconKey: 'trello' },
  { id: 'atlassian', name: 'Atlassian', iconKey: 'atlassian' },
  { id: 'jira', name: 'Jira', iconKey: 'jira' },
  { id: 'confluence', name: 'Confluence', iconKey: 'confluence' },
  { id: 'gitlab', name: 'GitLab', iconKey: 'gitlab' },
  { id: 'vercel', name: 'Vercel', iconKey: 'vercel' },
] as const;

export type PredefinedService = (typeof PREDEFINED_SERVICES)[number];
