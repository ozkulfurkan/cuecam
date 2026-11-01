import { act, fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { scriptStore } from '@/features/scripts/scriptStore';
import { storage } from '@/storage/storage';

// Native-backed modules used by the routes. (Reanimated: expo-router's testing
// library mocks it with 'react-native-reanimated/mock', which package.json maps
// to our __mocks__ file.)
jest.mock('react-native-vision-camera');
jest.mock('expo-media-library');
jest.mock('expo-screen-orientation');
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  init: jest.fn(),
  wrap: <T,>(component: T) => component,
  wrapExpoRouterErrorBoundary: <T,>(component: T) => component,
}));

beforeEach(() => {
  storage.clearAll();
  scriptStore.resetForTests();
});

describe('navigation', () => {
  it('opens on the Scripts tab with all four tabs visible', async () => {
    await renderRouter('./app');

    expect(screen).toHavePathname('/');
    expect(screen.getByText('No scripts yet')).toBeTruthy();
    expect(screen.getByLabelText(/^Scripts, tab/)).toBeTruthy();
    expect(screen.getByLabelText(/^Record, tab/)).toBeTruthy();
    expect(screen.getByLabelText(/^Recordings, tab/)).toBeTruthy();
    expect(screen.getByLabelText(/^Settings, tab/)).toBeTruthy();
  });

  it('switches to the Settings and Recordings tabs', async () => {
    await renderRouter('./app');

    await fireEvent.press(screen.getByLabelText(/^Settings, tab/));
    expect(screen).toHavePathname('/settings');

    await fireEvent.press(screen.getByLabelText(/^Recordings, tab/));
    expect(screen).toHavePathname('/recordings');
  });

  it('opens the recorder as a full-screen route from the Record tab and closes it', async () => {
    await renderRouter('./app');

    await fireEvent.press(screen.getByLabelText(/^Record, tab/));
    expect(screen).toHavePathname('/record');

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(screen).toHavePathname('/');
  });

  it('creates a script, edits it, and lists it with a reading time', async () => {
    const router = await renderRouter('./app');

    // The header + button and the empty-state button share the label.
    await fireEvent.press(screen.getAllByRole('button', { name: 'New script' })[0]);
    expect(router.getPathname()).toMatch(/^\/script\//);

    await fireEvent.changeText(screen.getByLabelText('Title'), 'Launch video');
    await fireEvent.changeText(
      screen.getByLabelText('Type or paste your script here…'),
      'word '.repeat(150),
    );
    expect(screen.getByText('150 words · ~01:00 at speed 4')).toBeTruthy();

    await act(() => testRouter.back());
    expect(screen).toHavePathname('/');
    expect(screen.getByText('Launch video')).toBeTruthy();
  });

  it('discards a new script left empty', async () => {
    await renderRouter('./app');

    await fireEvent.press(screen.getAllByRole('button', { name: 'New script' })[0]);
    await act(() => testRouter.back());

    expect(scriptStore.getAll()).toEqual([]);
    expect(screen.getByText('No scripts yet')).toBeTruthy();
  });

  it('records a script straight from the list', async () => {
    const script = scriptStore.create({ title: 'Pitch', body: 'Hello investors' });
    await renderRouter('./app');

    await fireEvent.press(screen.getByRole('button', { name: 'Record "Pitch"' }));

    expect(screen).toHavePathnameWithParams(`/record?scriptId=${script.id}`);
  });
});

describe('settings', () => {
  it('switches the app to Turkish and remembers it', async () => {
    const first = await renderRouter('./app');
    await fireEvent.press(screen.getByLabelText(/^Settings, tab/));

    await fireEvent.press(screen.getByRole('radio', { name: 'Türkçe' }));
    expect(screen.getByLabelText(/^Ayarlar, tab/)).toBeTruthy();
    expect(screen.getByText('Kayıt kalitesi')).toBeTruthy();
    await first.unmount();

    // Next launch starts in Turkish.
    await renderRouter('./app');
    expect(screen.getByText('Henüz senaryo yok')).toBeTruthy();
  });

  it('saves the recording quality', async () => {
    await renderRouter('./app');
    await fireEvent.press(screen.getByLabelText(/^Settings, tab/));

    await fireEvent.press(screen.getByRole('radio', { name: '4K' }));

    expect(screen.getByRole('radio', { name: '4K' }).props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(storage.getString('settings.videoQuality')).toBe('4k');
  });
});
