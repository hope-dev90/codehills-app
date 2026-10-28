import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  chocolate: '#4A2E1C',
  darkBrown: '#000000',
  caramel: '#A87542',
  ochre: '#C99A52',
  cream: '#F7F0E5',
  sandstone: '#E6D5BC',
  white: '#FFFFFF',
  // Supporting tones derived from the brand palette
  muted: '#7A6555',
  border: '#E1D2BB',
  danger: '#9B2C2C',
  olive: '#6B7B3A',
  overlay: 'rgba(43,33,27,0.55)',
} as const;

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  huge: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const shadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#2B211B',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 3 },
  default: {},
}) as ViewStyle;

export const textVariants = {
  display: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38 },
  title: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  subheading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
