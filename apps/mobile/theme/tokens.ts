// Design tokens mirroring system.css — source of truth for non-Tailwind usage
// (e.g. StyleSheet.create, react-native-track-player notification theme)

export const colors = {
  cream:          "#FFFFFF",
  cream2:         "#FDF6E8",
  cream3:         "#FAF6EC",
  ink:            "#1C1C1C",
  ink2:           "#3A3A3A",
  ink3:           "#5A5A5A",
  muted:          "#7A7A7A",
  line:           "#E8E8E8",
  line2:          "#F0F0F0",
  accentWarm:     "#B87A2E",
  popPeach:       "#F8DFB0",
  popPeachWarm:   "#FBE8C0",
  popLavender:    "#F0E5FB",
  success:        "#4F7F4B",
  danger:         "#C14E3C",
  warning:        "#D4923A",
} as const;

export const radius = {
  card:  14,
  hero:  24,
  phone: 42,
  pill:  100,
} as const;

export const spacing = {
  pagePadding:  18,
  cardPadding:  16,
  sectionGapSm: 14,
  sectionGapLg: 20,
} as const;

export const fonts = {
  display:        "InstrumentSerif_400Regular",
  displayItalic:  "InstrumentSerif_400Regular_Italic",
  body:           "DM_Sans_400Regular",
  bodyMedium:     "DM_Sans_500Medium",
  bodySemiBold:   "DM_Sans_600SemiBold",
  bodyBold:       "DM_Sans_700Bold",
  mono:           "JetBrainsMono_400Regular",
  monoMedium:     "JetBrainsMono_500Medium",
} as const;
