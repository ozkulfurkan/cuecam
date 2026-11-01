import { act, render, screen } from '@testing-library/react-native';
import * as reanimatedModule from 'react-native-reanimated';

import { PerfPanel } from './PerfPanel';

// Helper from __mocks__/react-native-reanimated.ts.
const reanimated = reanimatedModule as unknown as {
  mockRunFrames: (count: number, frameMs?: number) => void;
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const panelText = () =>
  screen
    .getByTestId('perf-panel')
    .children.map((line) => (line as unknown as { props: { children: string } }).props.children);

it('reports UI-thread FPS, dropped frames and elapsed time once a second', async () => {
  await render(<PerfPanel resetKey={0} />);

  // Two seconds of smooth 60 Hz frames, then one 100 ms hitch (5 lost frames).
  await act(() => reanimated.mockRunFrames(121, 1000 / 60));
  await act(() => reanimated.mockRunFrames(1, 100));
  await act(() => jest.advanceTimersByTime(1000));

  const [fps, details] = panelText();
  expect(fps).toMatch(/^UI 60 \(min 60\) · JS \d+/);
  expect(details).toMatch(/^drop 5 · .*00:01$/);
});

it('restarts the clock and the counters for a new take', async () => {
  const view = await render(<PerfPanel resetKey={0} />);
  await act(() => reanimated.mockRunFrames(2, 100));
  await act(() => jest.advanceTimersByTime(5000));
  expect(panelText()[1]).toMatch(/00:05$/);

  await view.rerender(<PerfPanel resetKey={1} />);
  await act(() => jest.advanceTimersByTime(2000));
  expect(panelText()[1]).toMatch(/^drop 0 · .*00:02$/);
});

it('stops its loops when it unmounts', async () => {
  const cancelFrame = jest.spyOn(globalThis, 'cancelAnimationFrame');
  const clearTimer = jest.spyOn(globalThis, 'clearInterval');
  const view = await render(<PerfPanel resetKey={0} />);
  await view.unmount();

  expect(cancelFrame).toHaveBeenCalled();
  expect(clearTimer).toHaveBeenCalled();
  jest.restoreAllMocks();
});
