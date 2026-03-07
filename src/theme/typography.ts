import {Platform} from 'react-native';

/**
 * Fustat font: use by spreading into style objects, e.g. ...FONTS.bold
 * Android uses res/font/fustat.xml family with fontWeight; iOS uses linked .ttf names.
 */
export const FONTS = {
  regular: Platform.select({
    android: {fontFamily: 'fustat' as const, fontWeight: '400' as const},
    ios: {fontFamily: 'Fustat-Regular' as const},
    default: {fontFamily: 'Fustat-Regular' as const},
  })!,
  medium: Platform.select({
    android: {fontFamily: 'fustat' as const, fontWeight: '500' as const},
    ios: {fontFamily: 'Fustat-Medium' as const},
    default: {fontFamily: 'Fustat-Medium' as const},
  })!,
  bold: Platform.select({
    android: {fontFamily: 'fustat' as const, fontWeight: '700' as const},
    ios: {fontFamily: 'Fustat-Bold' as const},
    default: {fontFamily: 'Fustat-Bold' as const},
  })!,
} as const;
