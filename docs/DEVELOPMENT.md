# Development build

Cue Cam uses native modules (camera, MMKV, …), so it runs as a **development build**,
not in Expo Go. The dev build is our own app binary with the Expo dev menu inside;
JS changes still hot-reload from Metro.

## Android (Windows)

### One-time setup

1. Install **Android Studio**. In _SDK Manager_ make sure these are installed:
   - Android SDK Platform (latest)
   - Android SDK Build-Tools, Platform-Tools, Emulator
2. Set user environment variables (Start → "ortam değişkenlerini düzenle"):

   | Variable       | Value                                         |
   | -------------- | --------------------------------------------- |
   | `ANDROID_HOME` | `%LOCALAPPDATA%\Android\Sdk`                  |
   | `JAVA_HOME`    | `C:\Program Files\Android\Android Studio\jbr` |
   | `Path` (+)     | `%LOCALAPPDATA%\Android\Sdk\platform-tools`   |
   | `Path` (+)     | `%LOCALAPPDATA%\Android\Sdk\emulator`         |

   Close and reopen VS Code afterwards so terminals pick them up.
   Check: `adb version` and `java -version` both print a version.

3. **Fix Windows' 260-character path limit.** Native C++ builds (Reanimated,
   Gesture Handler, Vision Camera, …) embed the project path twice in object file
   paths and fail with `ninja: error: mkdir(...): No such file or directory` —
   even at a short path like `C:\cuecam`. Three steps, all needed:
   - Keep the repo at a short path, e.g. `C:\cuecam` (not under `Desktop\…`).
   - Enable long paths (admin PowerShell), then reboot or reopen terminals:
     `Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' LongPathsEnabled 1`
   - Use CMake ≥ 3.31 from the SDK — the default 3.22.1 ships ninja 1.10, which
     ignores long paths. Install _Android SDK Command-line Tools_ in SDK Manager, then:
     `sdkmanager --install "cmake;3.31.6"` and add to `android/local.properties`:
     `cmake.dir=C\:/Users/<name>/AppData/Local/Android/Sdk/cmake/3.31.6`
     (forward slashes; re-add after any `npx expo prebuild`, which regenerates `android/`).

### Prepare the phone (USB debugging)

1. _Settings → About phone_ → tap **Build number** 7 times → "You are now a developer".
   (Xiaomi: _MIUI version_; Samsung: _Software information → Build number_.)
2. _Settings → System → Developer options_ → enable **USB debugging**.
   (Xiaomi also needs **Install via USB**.)
3. Connect with a data-capable USB cable. On the phone accept
   **"Allow USB debugging?"** (tick _Always allow from this computer_).
4. `adb devices` must list the phone as `device` (not `unauthorized`).

### Build and install

```bash
npm install
npx expo run:android --device   # pick the phone from the list
```

The first build takes several minutes (Gradle downloads). It generates the
`android/` folder (git-ignored — never edit it by hand; change `app.config.ts`
and run `npx expo prebuild --clean` instead), installs the app and starts Metro.

### Daily work

Once the dev build is on the phone you only need Metro:

```bash
npm start        # then press "a", or open Cue Cam on the phone
```

Rebuild (`npx expo run:android --device`) only when native code changes:
a new native package, a config plugin, or edits to `app.config.ts`.

The phone and the computer must be on the same Wi-Fi, or keep USB connected and
run `adb reverse tcp:8081 tcp:8081`.

## iOS without a Mac

Local iOS builds need Xcode (macOS only). Without a Mac we build in the cloud
with **EAS Build** (set up in PRM-3):

1. Apple Developer Program membership (paid) is required for installing on a device.
2. `npx eas-cli@latest device:create` → open the link on the iPhone to register it.
3. `npx eas-cli@latest build --profile development --platform ios`
4. Open the build link on the iPhone and install. Enable
   _Settings → Privacy & Security → Developer Mode_ when iOS asks.
5. Run `npm start` on the PC; the app connects to Metro over Wi-Fi.
