import { useEffect } from 'react';
import {
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ratioToValue, stepBy, valueToRatio } from '@/lib/range';
import { opacity, radius, sliderSize, touchTarget, useTheme } from '@/theme';

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

const ACCESSIBILITY_ACTIONS = [{ name: 'increment' }, { name: 'decrement' }] as const;

// The thumb follows the finger on the UI thread; the snapped value is reported
// to JS via onChange, which then re-positions the thumb on the exact step.
export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  accessibilityLabel,
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const trackWidth = useSharedValue(0);
  const ratio = useSharedValue(valueToRatio(value, min, max));

  useEffect(() => {
    ratio.set(valueToRatio(value, min, max));
  }, [ratio, value, min, max]);

  const emitRatio = (nextRatio: number) => {
    const next = ratioToValue(nextRatio, min, max, step);
    if (next !== value) onChange(next);
  };

  const moveTo = (x: number) => {
    'worklet';
    const width = trackWidth.get();
    if (width <= 0) return;
    const next = Math.min(Math.max(x / width, 0), 1);
    ratio.set(next);
    scheduleOnRN(emitRatio, next);
  };

  const pan = usePanGesture({
    enabled: !disabled,
    minDistance: 0,
    onBegin: (event) => {
      'worklet';
      moveTo(event.x);
    },
    onUpdate: (event) => {
      'worklet';
      moveTo(event.x);
    },
  });

  const fillStyle = useAnimatedStyle(() => ({ width: ratio.get() * trackWidth.get() }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ratio.get() * trackWidth.get() - sliderSize.thumb / 2 }],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    trackWidth.set(event.nativeEvent.layout.width);
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
    const next = stepBy(value, direction, min, max, step);
    if (next !== value) onChange(next);
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityState={{ disabled }}
        accessibilityActions={ACCESSIBILITY_ACTIONS}
        onAccessibilityAction={disabled ? undefined : onAccessibilityAction}
        onLayout={onLayout}
        style={[styles.container, disabled && styles.disabled]}
      >
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, fillStyle]} />
        </View>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: colors.accent, borderColor: colors.background },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    height: touchTarget,
    justifyContent: 'center',
  },
  track: {
    height: sliderSize.track,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: sliderSize.thumb,
    height: sliderSize.thumb,
    borderRadius: radius.pill,
    borderWidth: sliderSize.thumbBorder,
  },
  disabled: { opacity: opacity.disabled },
});
