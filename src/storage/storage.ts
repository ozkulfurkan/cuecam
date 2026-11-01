import { createMMKV } from 'react-native-mmkv';

/**
 * The app's single key-value store. Synchronous, so settings are available on
 * the first render without a loading state. Under Jest, react-native-mmkv
 * swaps in an in-memory store automatically.
 */
export const storage = createMMKV({ id: 'cuecam' });
