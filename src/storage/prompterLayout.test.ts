import { clearPrompterBox, loadPrompterBox, savePrompterBox } from './prompterLayout';
import { storage } from './storage';

beforeEach(() => storage.clearAll());

const box = { x: 0.1, y: 0.2, width: 0.6, height: 0.3 };

it('has no custom box by default', () => {
  expect(loadPrompterBox('top')).toBeUndefined();
});

it('remembers a box per camera side', () => {
  savePrompterBox('top', box);
  expect(loadPrompterBox('top')).toEqual(box);
  expect(loadPrompterBox('left')).toBeUndefined();
});

it('forgets the box on reset', () => {
  savePrompterBox('left', box);
  clearPrompterBox('left');
  expect(loadPrompterBox('left')).toBeUndefined();
});

it('ignores corrupt or out-of-range values', () => {
  storage.set('prompter.box.top', '{bad json');
  expect(loadPrompterBox('top')).toBeUndefined();
  storage.set('prompter.box.top', JSON.stringify({ ...box, width: 3 }));
  expect(loadPrompterBox('top')).toBeUndefined();
});
