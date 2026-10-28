import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, textVariants, TextVariant } from '../theme';

interface Props extends TextProps {
  variant?: TextVariant;
  color?: string;
}

export function AppText({ variant = 'body', color = colors.darkBrown, style, ...rest }: Props) {
  return <Text {...rest} style={[textVariants[variant], { color }, style]} />;
}
