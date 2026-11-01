// Reanimated stand-in for Jest, used for both "react-native-reanimated"
// (via __mocks__/react-native-reanimated.ts) and "react-native-reanimated/mock"
// (mapped in package.json; expo-router/testing-library requests that one).
//
// Reanimated's bundled mock still boots the real native entry points, which fail
// under jest-expo. Animation timing is not unit-tested (motion logic lives in pure
// functions), so a small synchronous stand-in is enough: shared values are plain
// boxes, animated styles are computed once, animations jump to their target.
// Extend it when a component starts using more of the API.
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

type Updater<T> = T | ((previous: T) => T);

export function makeMutable<T>(initial: T) {
  let current = initial;
  return {
    _isReanimatedSharedValue: true,
    get value() {
      return current;
    },
    set value(next: T) {
      current = next;
    },
    get: () => current,
    set: (next: Updater<T>) => {
      current = typeof next === 'function' ? (next as (previous: T) => T)(current) : next;
    },
  };
}

const passThrough = <T>(value: T) => value;

export const createAnimatedComponent = passThrough;

export function useSharedValue<T>(initial: T) {
  return useState(() => makeMutable(initial))[0];
}

export const useAnimatedStyle = <T>(updater: () => T) => updater();
export const useDerivedValue = <T>(compute: () => T) => makeMutable(compute());
export const withTiming = passThrough;
export const withSpring = passThrough;
export const cancelAnimation = () => {};

type FrameInfo = {
  timestamp: number;
  timeSincePreviousFrame: number | null;
  timeSinceFirstFrame: number;
};
const frameCallbacks = new Set<(info: FrameInfo) => void>();

/** Frame callbacks only run when a test calls mockRunFrames. */
export function useFrameCallback(callback: (info: FrameInfo) => void) {
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => {
    const run = (info: FrameInfo) => latest.current(info);
    frameCallbacks.add(run);
    return () => {
      frameCallbacks.delete(run);
    };
  }, []);
  return { setActive: () => {}, isActive: true, callbackId: 0 };
}

/** Test helper: deliver `count` frames, `frameMs` apart, to every frame callback. */
export function mockRunFrames(count: number, frameMs = 16) {
  for (let i = 1; i <= count; i++) {
    const info = {
      timestamp: i * frameMs,
      timeSincePreviousFrame: frameMs,
      timeSinceFirstFrame: i * frameMs,
    };
    frameCallbacks.forEach((run) => run(info));
  }
}

// Used by react-native-gesture-handler when Reanimated is installed.
export const isSharedValue = (value: unknown) =>
  typeof value === 'object' && value !== null && '_isReanimatedSharedValue' in value;
export const useEvent = () => () => {};
export const useHandler = () => ({ context: {}, doDependenciesDiffer: false, useWeb: false });
export const useComposedEventHandler = () => undefined;
export const setGestureState = () => {};

export default { View, Text, Image, ScrollView, createAnimatedComponent };
