export interface FileData {
  id: string;
  name: string;
  content: string;
  uri: string | null;
  isModified: boolean;
}

export interface TabFile {
  id: string;
  name: string;
  isModified: boolean;
}

export interface FileResult {
  success: boolean;
  content?: string;
  fileName?: string;
  uri?: string;
}

export interface TabMetadata {
  name: string;
  uri: string | null;
}
