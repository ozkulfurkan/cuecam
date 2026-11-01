// Used automatically by Jest for 'expo-file-system'. Files are tracked by URI
// in mockFiles; a URI exists until a test removes it or File.delete() runs.

export const mockFiles = {
  existing: new Set<string>(),
  deleted: [] as string[],
};

export class File {
  readonly uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  get exists() {
    return mockFiles.existing.has(this.uri);
  }

  delete() {
    mockFiles.existing.delete(this.uri);
    mockFiles.deleted.push(this.uri);
  }
}
