import { loadPrompterSettings, savePrompterSettings } from './prompterSettings';
import { storage } from './storage';

beforeEach(() => storage.clearAll());

it('starts from the defaults', () => {
  expect(loadPrompterSettings()).toEqual({ speed: 4, fontSize: 36 });
});

it('remembers the last values', () => {
  savePrompterSettings({ speed: 7 });
  savePrompterSettings({ fontSize: 48 });
  expect(loadPrompterSettings()).toEqual({ speed: 7, fontSize: 48 });
});

it('repairs out-of-range or invalid stored values', () => {
  storage.set('prompter.speed', 99);
  storage.set('prompter.fontSize', 37);
  expect(loadPrompterSettings()).toEqual({ speed: 10, fontSize: 38 });

  storage.set('prompter.speed', Number.NaN);
  expect(loadPrompterSettings().speed).toBe(4);
});
