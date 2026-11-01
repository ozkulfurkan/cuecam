// Used automatically by Jest for 'expo-media-library'. Tests configure the
// permission flow with setMockGalleryPermission and inspect mockGallery.

type Permission = { granted: boolean; canAskAgain: boolean };

const state = {
  current: { granted: true, canAskAgain: true } as Permission,
  afterRequest: { granted: true, canAskAgain: true } as Permission,
  requests: 0,
};

export const mockGallery = {
  albums: new Map<string, string[]>(),
  /** Set to make the next save throw. */
  failWith: undefined as string | undefined,
};

export function setMockGalleryPermission(current: Permission, afterRequest: Permission = current) {
  state.current = current;
  state.afterRequest = afterRequest;
  state.requests = 0;
}

export const mockPermissionRequests = () => state.requests;

export async function getPermissionsAsync() {
  return state.current;
}

export async function requestPermissionsAsync() {
  state.requests += 1;
  state.current = state.afterRequest;
  return state.current;
}

function throwIfFailing() {
  if (mockGallery.failWith) throw new Error(mockGallery.failWith);
}

export class Album {
  constructor(readonly id: string) {}

  static async get(title: string) {
    return mockGallery.albums.has(title) ? new Album(title) : null;
  }

  static async create(name: string, uris: string[]) {
    throwIfFailing();
    mockGallery.albums.set(name, [...uris]);
    return new Album(name);
  }
}

export class Asset {
  constructor(readonly id: string) {}

  static async create(uri: string, album?: Album) {
    throwIfFailing();
    if (album) mockGallery.albums.get(album.id)?.push(uri);
    return new Asset(uri);
  }
}
