import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import * as reanimatedModule from 'react-native-reanimated';

import { Prompter } from './Prompter';
import { lineHeightFor, pixelsPerSecond } from './scroll';

// Helper from __mocks__/react-native-reanimated.ts.
const reanimated = reanimatedModule as unknown as {
  mockRunFrames: (count: number, frameMs?: number) => void;
};

const box = { top: 100, left: 50, width: 280, height: 250 };

type Props = Partial<React.ComponentProps<typeof Prompter>>;

function props(overrides: Props = {}): React.ComponentProps<typeof Prompter> {
  return {
    text: 'Hello there',
    box,
    speed: 4,
    fontSize: 36,
    playing: false,
    restartKey: 0,
    onPress: () => {},
    ...overrides,
  };
}

/** Lays out tall content, runs frames, re-renders, and returns the scroll offset. */
async function scrollAfter(frames: number, view: Awaited<ReturnType<typeof render>>, p: Props) {
  await act(() => reanimated.mockRunFrames(frames, 100));
  await view.rerender(<Prompter {...props(p)} />);
  const scroller = screen.getByTestId('prompter-text').parent!;
  const { transform } = StyleSheet.flatten(scroller.props.style) as {
    transform: { translateY: number }[];
  };
  return -transform[0].translateY;
}

async function renderWithContent(p: Props) {
  const view = await render(<Prompter {...props(p)} />);
  const scroller = screen.getByTestId('prompter-text').parent!;
  await fireEvent(scroller, 'layout', { nativeEvent: { layout: { height: 5000 } } });
  return view;
}

it('shows the script with the chosen text size', async () => {
  await render(<Prompter {...props({ fontSize: 48 })} />);
  const text = screen.getByTestId('prompter-text');
  expect(text.props.children).toBe('Hello there');
  expect(text.props.style).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ fontSize: 48, lineHeight: lineHeightFor(48) }),
    ]),
  );
});

it('stays still while not playing', async () => {
  const view = await renderWithContent({ playing: false });
  expect(await scrollAfter(10, view, { playing: false })).toBe(0);
});

it('scrolls at the speed for the current settings while playing', async () => {
  const view = await renderWithContent({ playing: true });
  // 10 frames × 100 ms = 1 s.
  expect(await scrollAfter(10, view, { playing: true })).toBeCloseTo(pixelsPerSecond(4, 36));
});

it('picks up a speed change on the next frames', async () => {
  const view = await renderWithContent({ playing: true });
  const atSpeed4 = await scrollAfter(10, view, { playing: true, speed: 8 });
  const total = await scrollAfter(10, view, { playing: true, speed: 8 });
  expect(total - atSpeed4).toBeCloseTo(pixelsPerSecond(8, 36));
});

it('goes back to the top when restarted', async () => {
  const view = await renderWithContent({ playing: true });
  await scrollAfter(10, view, { playing: true });
  // The reset happens in an effect after the render that receives the new key;
  // the (mocked) animated style shows it on the following render.
  await scrollAfter(0, view, { playing: false, restartKey: 1 });
  expect(await scrollAfter(0, view, { playing: false, restartKey: 1 })).toBe(0);
});

it('reports taps so the screen can pause and resume', async () => {
  const onPress = jest.fn();
  await render(<Prompter {...props({ onPress })} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Script' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
