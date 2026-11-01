import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

describe('navigation', () => {
  it('opens on the Scripts tab with all three tabs visible', async () => {
    await renderRouter('./app');

    expect(screen).toHavePathname('/');
    expect(screen.getByText('Cue Cam')).toBeTruthy();
    expect(screen.getByLabelText(/^Scripts, tab/)).toBeTruthy();
    expect(screen.getByLabelText(/^Record, tab/)).toBeTruthy();
    expect(screen.getByLabelText(/^Settings, tab/)).toBeTruthy();
  });

  it('switches to the Settings tab', async () => {
    await renderRouter('./app');

    await fireEvent.press(screen.getByLabelText(/^Settings, tab/));

    expect(screen).toHavePathname('/settings');
  });

  it('opens the recorder as a full-screen route from the Record tab and closes it', async () => {
    await renderRouter('./app');

    await fireEvent.press(screen.getByLabelText(/^Record, tab/));
    expect(screen).toHavePathname('/record');

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(screen).toHavePathname('/');
  });
});
