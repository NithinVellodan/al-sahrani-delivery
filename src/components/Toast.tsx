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
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FONTS} from '../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  /** Display duration in ms. Defaults to 3200. */
  duration?: number;
}

export interface ToastRef {
  show:    (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  error:   (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  info:    (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
}

// ─── Singleton ref ────────────────────────────────────────────────────────────

const _toastRef = React.createRef<ToastRef>();

// ─── Inner animated component ─────────────────────────────────────────────────

const ToastInner = forwardRef<ToastRef>((_, ref) => {
  const insets = useSafeAreaInsets();

  const [visible,  setVisible]  = useState(false);
  const [message,  setMessage]  = useState('');
  // title/type kept for API compatibility only
  const [,         setTitle]    = useState('');
  const [,         setType]     = useState<ToastType>('default');

  const translateY   = useRef(new Animated.Value(-100)).current;
  const opacity      = useRef(new Animated.Value(0)).current;
  const scale        = useRef(new Animated.Value(0.9)).current;
  const progress     = useRef(new Animated.Value(1)).current;
  const hideTimer    = useRef<ReturnType<typeof setTimeout>>();
  const progressAnim = useRef<Animated.CompositeAnimation>();

  const hide = useCallback(() => {
    if (hideTimer.current)    clearTimeout(hideTimer.current);
    if (progressAnim.current) progressAnim.current.stop();

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -110,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [opacity, translateY]);

  const show = useCallback(
    (msg: string, options: ToastOptions = {}) => {
      const duration = options.duration ?? 3200;

      if (hideTimer.current)    clearTimeout(hideTimer.current);
      if (progressAnim.current) progressAnim.current.stop();

      setMessage(msg);
      setTitle(options.title ?? '');
      setType(options.type ?? 'default');
      progress.setValue(1);
      setVisible(true);

      translateY.setValue(-110);
      opacity.setValue(0);
      scale.setValue(0.92);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          stiffness: 260,
          damping: 24,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          stiffness: 280,
          damping: 22,
          useNativeDriver: true,
        }),
      ]).start();

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

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.pill,
        {top: insets.top + 600, opacity, transform: [{translateY}, {scale}]},
      ]}>
      <Text style={s.txt} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
});

// ─── Public ToastRoot (mount once at app root) ────────────────────────────────

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

const s = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    backgroundColor: 'rgba(28,28,30,0.88)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 12,
  },
  txt: {
    fontSize: 13,
    ...FONTS.medium,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
