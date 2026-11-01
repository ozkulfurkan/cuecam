import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing, useTheme } from '@/theme';

import type { PrompterBox } from './layout';
import {
  advanceOffset,
  jumpOffset,
  lineHeightFor,
  maxScrollOffset,
  pixelsPerSecond,
} from './scroll';

type Props = {
  text: string;
  box: PrompterBox;
  speed: number;
  fontSize: number;
  playing: boolean;
  /** Change this value to jump back to the top (e.g. for a new recording). */
  restartKey: number;
  /** A new `id` moves the text by `lines` (negative = back), paused or not. */
  jump?: { id: number; lines: number };
  onPress: () => void;
};

/**
 * Scrolling script. The scroll runs entirely on the UI thread: a frame callback
 * advances a shared offset each frame, so the camera, the recorder and JS work
 * cannot make it stutter. Speed changes apply on the next frame.
 */
export function Prompter({
  text,
  box,
  speed,
  fontSize,
  playing,
  restartKey,
  jump,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const offset = useSharedValue(0);
  const pxPerSecond = useSharedValue(pixelsPerSecond(speed, fontSize));
  const isPlaying = useSharedValue(playing);
  const contentHeight = useSharedValue(0);
  const viewportHeight = useSharedValue(box.height);
  // Applied by the frame callback on the UI thread, which owns the offset.
  const pendingJump = useSharedValue(0);

  useEffect(() => {
    pxPerSecond.set(pixelsPerSecond(speed, fontSize));
  }, [pxPerSecond, speed, fontSize]);

  useEffect(() => {
    isPlaying.set(playing);
  }, [isPlaying, playing]);

  useEffect(() => {
    viewportHeight.set(box.height);
  }, [viewportHeight, box.height]);

  useEffect(() => {
    offset.set(0);
  }, [offset, restartKey]);

  const jumpId = jump?.id;
  const jumpPx = (jump?.lines ?? 0) * lineHeightFor(fontSize);
  useEffect(() => {
    if (jumpId !== undefined) pendingJump.set(jumpPx);
    // Only a new jump id triggers a jump, not a font size change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpId, pendingJump]);

  useFrameCallback((frame) => {
    const delta = pendingJump.get();
    if (delta !== 0) {
      pendingJump.set(0);
      offset.set(
        jumpOffset(offset.get(), delta, maxScrollOffset(contentHeight.get(), viewportHeight.get())),
      );
    }
    if (!isPlaying.get()) return;
    offset.set(
      advanceOffset(
        offset.get(),
        pxPerSecond.get(),
        frame.timeSincePreviousFrame,
        maxScrollOffset(contentHeight.get(), viewportHeight.get()),
      ),
    );
  });

  const scrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -offset.get() }],
  }));

  const onContentLayout = (event: LayoutChangeEvent) => {
    contentHeight.set(event.nativeEvent.layout.height);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('recorder.script')}
      accessibilityHint={t(playing ? 'recorder.pauseHint' : 'recorder.resumeHint')}
      onPress={onPress}
      style={[
        styles.box,
        {
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          backgroundColor: colors.scrim,
        },
      ]}
    >
      <Animated.View onLayout={onContentLayout} style={[styles.content, scrollStyle]}>
        <Text
          testID="prompter-text"
          style={[
            styles.text,
            { color: colors.onScrim, fontSize, lineHeight: lineHeightFor(fontSize) },
          ]}
        >
          {text}
        </Text>
        {/* Lets the last line scroll all the way up to the top of the box. */}
        <View style={{ height: box.height }} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  // Absolutely positioned so its height is the full script, not squeezed to the
  // box height (in normal flow, layout would shrink the text to fit the box).
  content: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
  },
  text: {
    fontWeight: '600',
  },
});
