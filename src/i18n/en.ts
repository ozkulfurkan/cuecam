// English strings. `tr.ts` must provide the same keys (enforced by its type).
// Placeholders in {braces} are filled by t(key, params).
export const en = {
  'tabs.scripts': 'Scripts',
  'tabs.record': 'Record',
  'tabs.recordings': 'Recordings',
  'tabs.settings': 'Settings',

  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.openSettings': 'Open Settings',
  'common.untitled': 'Untitled script',

  'permissions.camera': 'Camera',
  'permissions.microphone': 'Microphone',
  'permissions.and': '{first} and {second}',
  'permissions.requestTitle': 'Camera and microphone',
  'permissions.requestBody':
    'Cue Cam records video and sound while you read your script. Allow access to start recording.',
  'permissions.allow': 'Allow access',
  'permissions.offTitle': '{names} access is off',
  'permissions.offBody': 'Turn on {names} for Cue Cam in Settings, then come back here.',
  'permissions.restrictedTitle': '{names} is restricted',
  'permissions.restrictedBody':
    'This device blocks {names} access (for example Screen Time or a device policy). It can only be changed by whoever manages the device.',

  'recorder.noCamera': 'No camera available',
  'recorder.switchToBack': 'Switch to back camera',
  'recorder.switchToFront': 'Switch to front camera',
  'recorder.start': 'Start recording',
  'recorder.stop': 'Stop recording',
  'recorder.cancelCountdown': 'Cancel countdown',
  'recorder.timer': 'Recording, {time}',
  'recorder.failed': 'Recording failed: {error}',
  'recorder.paused': 'Paused · tap the text to continue',
  'recorder.saving': 'Saving to gallery…',
  'recorder.saved': 'Saved to the "{album}" album',
  'recorder.notSavedSettings': 'Not saved: allow Photos access in Settings to save recordings',
  'recorder.notSavedDenied': 'Not saved: Photos access was not allowed',
  'recorder.notSavedError': 'Not saved: {error}',
  'recorder.interrupted': 'Recording was interrupted',
  'recorder.stoppedStorageFull': 'Recording stopped: storage is almost full',
  'recorder.stoppedHot': 'Recording stopped: the phone is too hot',
  'recorder.keptSaving': '{why} — saving the video…',
  'recorder.keptSaved': '{why} — video saved to the "{album}" album',
  'recorder.keptNotSaved': '{why}. {reason}',
  'recorder.warm': 'Phone is getting warm — long takes may drop frames',
  'recorder.hot': 'Phone is very hot — the camera may stop soon',

  'preRecord.title': 'Before you record',
  'preRecord.storageLow': 'Storage is running low: about {minutes} min of {quality} video fits.',
  'preRecord.storageCritical':
    'Storage is almost full: less than {minutes} min of {quality} video fits. Recording stops by itself when space runs out; the video is kept.',
  'preRecord.hot':
    'The phone is very hot. The camera may stop or drop frames; let it cool down if you can.',
  'preRecord.recordAnyway': 'Record anyway',
  'recorder.script': 'Script',
  'recorder.pauseHint': 'Pauses scrolling',
  'recorder.resumeHint': 'Resumes scrolling',

  'prompter.speed': 'Speed {value}',
  'prompter.size': 'Size {value}',
  'prompter.speedLabel': 'Scroll speed',
  'prompter.sizeLabel': 'Text size',

  'scripts.title': 'Scripts',
  'scripts.new': 'New script',
  'scripts.search': 'Search scripts',
  'scripts.emptyTitle': 'No scripts yet',
  'scripts.emptyBody': 'Write or paste the text you want to read on camera.',
  'scripts.noResults': 'No scripts match "{query}"',
  'scripts.readingTime': '~{time} at speed {speed}',
  'scripts.words': '{count} words',
  'scripts.record': 'Record',
  'scripts.recordThis': 'Record "{title}"',

  'editor.title': 'Edit script',
  'editor.titlePlaceholder': 'Title',
  'editor.bodyPlaceholder': 'Type or paste your script here…',
  'editor.paste': 'Paste',
  'editor.pasteHint': 'Adds the text from the clipboard to the end of the script',
  'editor.importTxt': 'Import .txt',
  'editor.clipboardEmpty': 'The clipboard has no text to paste.',
  'editor.importFailed': 'Could not import the file: {error}',
  'editor.deleteTitle': 'Delete this script?',
  'editor.deleteBody': '"{title}" will be removed. Recorded videos are kept.',

  'recordings.title': 'Recordings',
  'recordings.emptyTitle': 'No recordings yet',
  'recordings.emptyBody': 'Videos you record are saved to the "{album}" album and listed here.',
  'recordings.permission': 'Allow Photos access to see your recordings.',
  'recordings.allow': 'Allow access',
  'recordings.share': 'Share',
  'recordings.play': 'Play recording from {date}',
  'recordings.loadFailed': 'Could not load recordings: {error}',

  'settings.title': 'Settings',
  'settings.prompter': 'Prompter',
  'settings.prompterHint': 'You can also change these while recording.',
  'settings.video': 'Video',
  'settings.quality': 'Recording quality',
  'settings.qualityHint':
    'Higher quality uses more storage. If the camera does not support it, the closest quality is used.',
  'settings.language': 'Language',
  'settings.languageSystem': 'System',
  'settings.developer': 'Developer',
  'settings.testCrash': 'Test crash',
  'settings.testCrashHint': 'Throws an error to check that Sentry receives it',

  'sample.script': `Hi, and welcome to Cue Cam.

This is a sample script so you can try the prompter before writing your own.

Keep your eyes on these lines while you speak. They sit right under the camera, so on video it looks like you are talking straight to your audience.

Tap the text at any time to pause it, and tap again to carry on. Use the sliders below to change the speed and the size of the text, even while you are recording.

When you press the red button, a short countdown gives you a moment to get ready. Recording and scrolling then start together.

Speak at a natural pace and let the text follow you. If you fall behind, slow it down a little. If you are waiting for the words, speed it up.

When you are done, press the red square to stop. Your video is saved to the Prompter album in your gallery.

Thanks for trying Cue Cam. Now go and record something great.`,
} as const;

export type StringKey = keyof typeof en;
