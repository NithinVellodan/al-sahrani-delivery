import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {FONTS} from '../theme/typography';
import { COLORS } from '../theme/colors';

/**
 * Al Zahrani Food Delivery — frosted logo pill.
 * Drop inside any Animated.View / banner wrapper with position:'relative'.
 */
const LogoContent = ({showTag}: {showTag: boolean}) => (
  <>
    <Image
      source={require('../images/logo-no-background.png')}
      style={s.logoImg}
      resizeMode="contain"
    />
    <View style={s.textBlock}>
      <Text style={s.wordAl}>Al</Text>
      <Text style={s.wordZahrani}>Zahrani</Text>
    </View>
    {showTag && (
      <View style={s.tagWrap}>
        <Text style={s.tag}>FOOD DELIVERY</Text>
      </View>
    )}
  </>
);

export default function BrandLogo({
  noContainer,
  showTag = true,
}: {
  noContainer?: boolean;
  showTag?: boolean;
}) {
  if (noContainer) {
    return <LogoContent showTag={showTag} />;
  }
  return (
    <View style={s.pill}>
      <LogoContent showTag={showTag} />
    </View>
  );
}

const TEAL = '#2EA87E';

const s = StyleSheet.create({
  pill: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
    elevation: 8,
  },
  logoImg: {
    width: 36,
    height: 36,
  },
  textBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  wordAl: {
    fontSize: 22,
    ...FONTS.bold,
    color: COLORS.mainColor,
    letterSpacing: 0.5,
  },
  wordZahrani: {
    fontSize: 22,
    ...FONTS.bold,
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  tagWrap: {
    borderLeftWidth: 1.5,
    borderLeftColor: '#E0E0E0',
    paddingLeft: 4,
  },
  tag: {
    fontSize: 9,
    ...FONTS.bold,
    color: '#999',
    letterSpacing: 2,
  },
});
