import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  /** Display duration in ms. Defaults to 3200. */
  duration?: number;
}

export interface ToastRef {
  show: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
}

// ─── Per-type visual config ───────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ToastType,
  {icon: string; accent: string}
> = {
  success: {icon: '✓', accent: COLORS.successGreen},
  error:   {icon: '✕', accent: '#D94F4F'},
  info:    {icon: 'i', accent: COLORS.brandDark},
  warning: {icon: '!', accent: COLORS.warmYellow},
  default: {icon: '✦', accent: COLORS.softGold},
};

// ─── Module-level singleton ref ───────────────────────────────────────────────

const _toastRef = React.createRef<ToastRef>();

// ─── Inner animated component ─────────────────────────────────────────────────

const ToastInner = forwardRef<ToastRef>((_, ref) => {
  const insets = useSafeAreaInsets();

  const [visible, setVisible]   = useState(false);
  const [message, setMessage]   = useState('');
  const [title, setTitle]       = useState('');
  const [type, setType]         = useState<ToastType>('default');

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.86)).current;
  const progress   = useRef(new Animated.Value(1)).current;

  const hideTimer    = useRef<ReturnType<typeof setTimeout>>();
  const progressAnim = useRef<Animated.CompositeAnimation>();

  const hide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (progressAnim.current) progressAnim.current.stop();

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.88,
        duration: 260,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [opacity, scale, translateY]);

  const show = useCallback(
    (msg: string, options: ToastOptions = {}) => {
      const duration = options.duration ?? 3200;

      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (progressAnim.current) progressAnim.current.stop();

      setMessage(msg);
      setTitle(options.title ?? '');
      setType(options.type ?? 'default');
      progress.setValue(1);
      setVisible(true);

      // Reset values before animating in
      translateY.setValue(-140);
      opacity.setValue(0);
      scale.setValue(0.86);

      // Entry: spring slide-down + fade + scale
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          stiffness: 220,
          damping: 22,
          mass: 0.85,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          stiffness: 240,
          damping: 20,
          mass: 0.75,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress bar drain
      progressAnim.current = Animated.timing(progress, {
        toValue: 0,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      progressAnim.current.start();

      hideTimer.current = setTimeout(hide, duration);
    },
    [hide, opacity, progress, scale, translateY],
  );

  useImperativeHandle(ref, () => ({
    show,
    success: (msg, opts) => show(msg, {...opts, type: 'success'}),
    error:   (msg, opts) => show(msg, {...opts, type: 'error'}),
    info:    (msg, opts) => show(msg, {...opts, type: 'info'}),
    warning: (msg, opts) => show(msg, {...opts, type: 'warning'}),
  }));

  if (!visible) {
    return null;
  }

  const cfg = TYPE_CONFIG[type];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: insets.top + 12,
          opacity,
          transform: [{translateY}, {scale}],
        },
      ]}>

      {/* Left accent stripe */}
      <View style={[styles.stripe, {backgroundColor: cfg.accent}]} />

      {/* Icon badge */}
      <View style={[styles.iconBadge, {backgroundColor: cfg.accent + '28'}]}>
        <Text style={[styles.iconText, {color: cfg.accent}]}>{cfg.icon}</Text>
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        {title ? (
          <Text style={[styles.titleText, {color: cfg.accent}]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        <Text style={styles.messageText} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: cfg.accent,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </Animated.View>
  );
});

// ─── Public ToastRoot (mount once near root of the app) ──────────────────────

export const ToastRoot: React.FC = () => <ToastInner ref={_toastRef} />;

// ─── Imperative API ───────────────────────────────────────────────────────────

const toast = {
  show:    (message: string, options?: ToastOptions) =>
    _toastRef.current?.show(message, options),
  success: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    _toastRef.current?.success(message, options),
  error:   (message: string, options?: Omit<ToastOptions, 'type'>) =>
    _toastRef.current?.error(message, options),
  info:    (message: string, options?: Omit<ToastOptions, 'type'>) =>
    _toastRef.current?.info(message, options),
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    _toastRef.current?.warning(message, options),
};

export default toast;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13100A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    overflow: 'hidden',
    // Soft gold glow shadow
    shadowColor: COLORS.softGold,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(233,185,95,0.12)',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    flexShrink: 0,
  },
  iconText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  textBlock: {
    flex: 1,
  },
  titleText: {
    fontSize: 12,
    ...FONTS.bold,
    marginBottom: 2,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 14,
    color: '#F5E8CA',
    ...FONTS.regular,
    lineHeight: 20,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2.5,
    borderRadius: 2,
  },
});
