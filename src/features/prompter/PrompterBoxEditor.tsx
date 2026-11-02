import { SymbolView } from 'expo-symbols';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { IconButton } from '@/components/IconButton';
import { useI18n } from '@/i18n/I18nProvider';
import { frameBorderWidth, iconSize, radius, touchTarget, useTheme } from '@/theme';

import { moveBox, resizeBox, type Bounds } from './boxEdit';
import type { PrompterBox } from './layout';

type Props = {
  box: PrompterBox;
  bounds: Bounds;
  /** True when the user has moved/resized the box (shows the reset button). */
  isCustom: boolean;
  /** Called on every drag step, to redraw the box. */
  onChange: (box: PrompterBox) => void;
  /** Called once when a drag ends, to save the box. */
  onCommit: (box: PrompterBox) => void;
  onReset: () => void;
};

/**
 * Drag handles over the prompter box, shown only before recording: drag the
 * box to move it, drag the corner handle to resize it. Setup happens while no
 * take is running, so the gestures run on the JS thread (simpler, no worklets).
 */
export function PrompterBoxEditor({ box, bounds, isCustom, onChange, onCommit, onReset }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const start = useRef(box);
  const latest = useRef(box);
  // Follows the box from props too (reset, rotation), not only from drags.
  useEffect(() => {
    latest.current = box;
  }, [box]);

  const update = (next: PrompterBox) => {
    latest.current = next;
    onChange(next);
  };

  const move = usePanGesture({
    runOnJS: true,
    onActivate: () => {
      start.current = latest.current;
    },
    onUpdate: (event) => {
      update(moveBox(start.current, event.translationX, event.translationY, bounds));
    },
    onDeactivate: () => onCommit(latest.current),
  });

  const resize = usePanGesture({
    runOnJS: true,
    minDistance: 0,
    onActivate: () => {
      start.current = latest.current;
    },
    onUpdate: (event) => {
      update(resizeBox(start.current, event.translationX, event.translationY, bounds));
    },
    onDeactivate: () => onCommit(latest.current),
  });

  return (
    <>
      <GestureDetector gesture={move}>
        <View
          accessibilityLabel={t('prompter.moveBox')}
          testID="prompter-box-move"
          style={[
            styles.frame,
            {
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              borderColor: colors.accent,
            },
          ]}
        />
      </GestureDetector>
      <GestureDetector gesture={resize}>
        <View
          accessibilityLabel={t('prompter.resizeBox')}
          testID="prompter-box-resize"
          style={[
            styles.handle,
            {
              // Centered on the bottom-right corner, half outside the box.
              top: box.top + box.height - touchTarget / 2,
              left: box.left + box.width - touchTarget / 2,
              backgroundColor: colors.accent,
            },
          ]}
        >
          <SymbolView
            name={{ ios: 'arrow.up.left.and.arrow.down.right', android: 'open_in_full' }}
            tintColor={colors.onAccent}
            size={iconSize.sm}
          />
        </View>
      </GestureDetector>
      {isCustom ? (
        <View
          style={[
            styles.reset,
            { top: box.top - touchTarget / 2, left: box.left + box.width - touchTarget / 2 },
          ]}
        >
          <IconButton
            icon={{ ios: 'arrow.counterclockwise', android: 'restart_alt' }}
            accessibilityLabel={t('prompter.resetBox')}
            onPress={onReset}
          />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    borderWidth: frameBorderWidth,
    borderStyle: 'dashed',
    borderRadius: radius.md,
  },
  handle: {
    position: 'absolute',
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reset: { position: 'absolute' },
});
