import { StyleSheet, Text, View } from 'react-native';

import { Slider } from '@/components/Slider';
import { radius, spacing, textStyles, useTheme } from '@/theme';

import { FONT_SIZE_RANGE, SPEED_RANGE } from './scroll';

type Props = {
  speed: number;
  fontSize: number;
  onSpeedChange: (speed: number) => void;
  onFontSizeChange: (fontSize: number) => void;
};

/** Speed and text-size sliders. Usable while recording; changes apply at once. */
export function PrompterControls({ speed, fontSize, onSpeedChange, onFontSizeChange }: Props) {
  const { colors } = useTheme();
  const labelStyle = [textStyles.caption, styles.label, { color: colors.onScrim }];

  return (
    <View style={[styles.panel, { backgroundColor: colors.scrim }]}>
      <View style={styles.row}>
        <Text style={labelStyle}>{`Speed ${speed}`}</Text>
        <View style={styles.slider}>
          <Slider
            value={speed}
            min={SPEED_RANGE.min}
            max={SPEED_RANGE.max}
            step={SPEED_RANGE.step}
            onChange={onSpeedChange}
            accessibilityLabel="Scroll speed"
          />
        </View>
      </View>
      <View style={styles.row}>
        <Text style={labelStyle}>{`Size ${fontSize}`}</Text>
        <View style={styles.slider}>
          <Slider
            value={fontSize}
            min={FONT_SIZE_RANGE.min}
            max={FONT_SIZE_RANGE.max}
            step={FONT_SIZE_RANGE.step}
            onChange={onFontSizeChange}
            accessibilityLabel="Text size"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    // Wide enough for "Speed 10" / "Size 64" so the sliders do not shift.
    minWidth: spacing.xl * 2,
  },
  slider: { flex: 1 },
});
