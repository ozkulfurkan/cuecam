import { act, fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { onboardingStore } from '@/features/onboarding/onboardingStore';
import { scriptStore } from '@/features/scripts/scriptStore';
import { saveOnboardingCompleted } from '@/storage/onboarding';
import { storage } from '@/storage/storage';
import * as visionCameraModule from 'react-native-vision-camera';

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

type Status = 'not-determined' | 'authorized';
// Helpers from __mocks__/react-native-vision-camera.ts (shared mock instance).
const { requestCalls, setMockPermissions } = visionCameraModule as unknown as {
  setMockPermissions: (statuses: { camera?: Status; microphone?: Status }) => void;
  requestCalls: string[];
};

beforeEach(() => {
  storage.clearAll();
  scriptStore.resetForTests();
  onboardingStore.resetForTests();
  // Most tests start in the app itself; the intro has its own tests below.
  saveOnboardingCompleted(true);
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

describe('onboarding', () => {
  beforeEach(() => {
    saveOnboardingCompleted(false);
    setMockPermissions({ camera: 'not-determined', microphone: 'not-determined' });
    requestCalls.length = 0;
  });

  it('shows the intro on first launch, then asks for access and opens the app', async () => {
    await renderRouter('./app');
    expect(screen).toHavePathname('/onboarding');
    expect(screen.getByText('Read while you record')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('You set the pace')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Why Cue Cam asks for access')).toBeTruthy();
    expect(screen.getByText('Camera — to film you while you read')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Allow camera and microphone' }));
    expect(requestCalls).toEqual(['camera', 'microphone']);
    expect(screen).toHavePathname('/');
    expect(screen.getByText('No scripts yet')).toBeTruthy();
  });

  it('can be skipped without asking for anything, and is not shown again', async () => {
    await renderRouter('./app');
    await fireEvent.press(screen.getByRole('button', { name: 'Skip' }));
    expect(screen).toHavePathname('/');
    expect(requestCalls).toEqual([]);

    onboardingStore.resetForTests();
    await renderRouter('./app');
    expect(screen).toHavePathname('/');
  });

  it('goes back a page', async () => {
    await renderRouter('./app');
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Read while you record')).toBeTruthy();
  });

  it('can be reopened from Settings and finished with "Get started" when access is granted', async () => {
    setMockPermissions({ camera: 'authorized', microphone: 'authorized' });
    saveOnboardingCompleted(true);
    await renderRouter('./app');

    await fireEvent.press(screen.getByLabelText(/^Settings, tab/));
    await fireEvent.press(screen.getByRole('button', { name: 'Show introduction' }));
    expect(screen).toHavePathname('/onboarding');

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    expect(requestCalls).toEqual([]);
    expect(screen).toHavePathname('/');
  });
});
