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

export interface TabsProps {
  files: TabFile[];
  activeFileId: string;
  isDark: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

export interface EditorProps {
  content: string;
  isDark: boolean;
  editable: boolean;
  fontSize: number;
  onChangeText: (text: string) => void;
}

export interface PromptConfig {
  firstLaunchDate: number;
  hasPrompted: boolean;
}

export interface SupportPromptProps {
  isDark: boolean;
}
