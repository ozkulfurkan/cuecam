import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { darkPalette, lightPalette, ThemeProvider, useTheme } from '@/theme';

import { Button } from './Button';
import { Card } from './Card';
import { IconButton } from './IconButton';
import { Screen } from './Screen';
import { Slider } from './Slider';

// SafeAreaProvider renders nothing until it has measured; give it fixed metrics.
const TEST_METRICS = initialWindowMetrics ?? {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('Button', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Start" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Start' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Start" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Start' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('is reachable by its accessibility label', async () => {
    const onPress = jest.fn();
    await render(
      <IconButton
        icon={{ ios: 'xmark', android: 'close' }}
        accessibilityLabel="Close"
        onPress={onPress}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Card and Screen', () => {
  it('render their children', async () => {
    await render(
      <SafeAreaProvider initialMetrics={TEST_METRICS}>
        <Screen>
          <Card>
            <Text>Inside</Text>
          </Card>
        </Screen>
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Inside')).toBeTruthy();
  });
});

describe('Slider', () => {
  function renderSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
    const onChange = jest.fn();
    return render(
      <GestureHandlerRootView>
        <Slider
          value={10}
          min={0}
          max={20}
          step={2}
          onChange={onChange}
          accessibilityLabel="Speed"
          {...props}
        />
      </GestureHandlerRootView>,
    ).then(() => ({ onChange, slider: screen.getByRole('adjustable', { name: 'Speed' }) }));
  }

  it('exposes its range to screen readers', async () => {
    const { slider } = await renderSlider();
    expect(slider.props.accessibilityValue).toEqual({ min: 0, max: 20, now: 10 });
  });

  it('steps up and down with accessibility actions', async () => {
    const { onChange, slider } = await renderSlider();
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange.mock.calls).toEqual([[12], [8]]);
  });

  it('does not report a change past the end of the range', async () => {
    const { onChange, slider } = await renderSlider({ value: 20 });
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('ThemeProvider', () => {
  function SchemeProbe() {
    const { scheme, colors } = useTheme();
    return <Text>{`${scheme} ${colors.background}`}</Text>;
  }

  it('defaults to dark', async () => {
    await render(
      <ThemeProvider>
        <SchemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByText(`dark ${darkPalette.background}`)).toBeTruthy();
  });

  it('switches to the light palette', async () => {
    await render(
      <ThemeProvider preference="light">
        <SchemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByText(`light ${lightPalette.background}`)).toBeTruthy();
  });
});
