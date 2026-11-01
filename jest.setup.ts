// Native-backed gesture and worklet libraries ship their own Jest mocks.
// Reanimated is replaced by __mocks__/react-native-reanimated.ts.
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
