import type { SearchMatch } from "@/lib/searchHelpers";
import type {
  DimensionValue,
  TextInputSelectionChangeEvent,
  TextLayoutEvent,
} from "react-native";

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
  fontFamily?: string;
  edgeSpacing: number;
  highlightLine: boolean;
  showLineNumbers: boolean;
  wordWrap?: boolean;
  currentLine: number;
  autoFocus?: boolean;
  searchMatches?: SearchMatch[];
  activeMatchIndex?: number;
  onChangeText: (text: string) => void;
  onSelectionChange: (line: number) => void;
  onReadOnlyNotice?: () => void;
}

export interface PromptConfig {
  firstLaunchDate: number;
  hasPrompted: boolean;
}

export interface SupportPromptProps {
  isDark: boolean;
}

export interface EditorCanvasProps {
  editable: boolean;
  fontSize: number;
  lineHeight: number;
  resolvedFont: string;
  isDark: boolean;
  padLeft: number;
  wordWrap: boolean;
  canvasWidth: DimensionValue;
  totalHeight?: number;
  highlightLine: boolean;
  highlightTop: number;
  currentLineHeight: number;
  normalizedContent: string;
  searchMatches?: SearchMatch[];
  activeMatchIndex?: number;
  handleTextLayout: (e: TextLayoutEvent) => void;
  handleChangeText: (text: string) => void;
  handleSelectionChange: (e: TextInputSelectionChangeEvent) => void;
  onActiveLinkChange?: (url: string | null) => void;
  onTapBlank: () => void;
  onReadOnlyNotice?: () => void;
}
