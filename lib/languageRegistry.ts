export interface LanguageInfo {
  id: string;
  name: string;
  isCode: boolean;
  mimeType: string;
}

type LangEntry = [
  id: string,
  name: string,
  extensions: string[],
  mimeType: string,
  isCode: boolean,
];

const RAW_REGISTRY: readonly LangEntry[] = [
  ["typescript", "TypeScript", [".ts", ".tsx", ".mts", ".cts"], "application/typescript", true],
  ["javascript", "JavaScript", [".js", ".jsx", ".mjs", ".cjs"], "application/javascript", true],
  ["python", "Python", [".py", ".pyw", ".pyi"], "text/x-python", true],
  ["html", "HTML", [".html", ".htm", ".xhtml"], "text/html", true],
  ["css", "CSS", [".css", ".scss", ".sass", ".less"], "text/css", true],
  ["rust", "Rust", [".rs"], "text/x-rust", true],
  ["c", "C", [".c", ".h"], "text/x-c", true],
  ["cpp", "C++", [".cpp", ".hpp", ".cc", ".hh", ".cxx", ".hxx"], "text/x-c++", true],
  ["csharp", "C#", [".cs", ".csx"], "text/plain", true],
  ["java", "Java", [".java"], "text/x-java-source", true],
  ["kotlin", "Kotlin", [".kt", ".kts"], "text/plain", true],
  ["swift", "Swift", [".swift"], "text/plain", true],
  ["go", "Go", [".go"], "text/x-go", true],
  ["php", "PHP", [".php", ".phtml"], "application/x-httpd-php", true],
  ["ruby", "Ruby", [".rb", ".rake", ".gemspec"], "text/x-ruby", true],
  ["lua", "Lua", [".lua"], "text/x-lua", true],
  ["r", "R", [".r", ".rmd"], "text/x-r", true],
  ["sql", "SQL", [".sql", ".pgsql"], "application/sql", true],
  ["json", "JSON", [".json", ".jsonc", ".json5"], "application/json", true],
  ["yaml", "YAML", [".yaml", ".yml"], "text/yaml", true],
  ["xml", "XML", [".xml", ".svg", ".xaml", ".plist"], "application/xml", true],
  ["markdown", "Markdown", [".md", ".markdown"], "text/markdown", true],
  ["shell", "Shell / Bash", [".sh", ".bash", ".zsh", ".fish"], "application/x-sh", true],
  ["powershell", "PowerShell", [".ps1", ".psm1"], "text/plain", true],
  ["batch", "Batch", [".bat", ".cmd"], "text/plain", true],
  ["dart", "Dart", [".dart"], "application/vnd.dart", true],
  ["scala", "Scala", [".scala", ".sc"], "text/x-scala", true],
  ["perl", "Perl", [".pl", ".pm"], "text/x-perl", true],
  ["haskell", "Haskell", [".hs", ".lhs"], "text/x-haskell", true],
  ["elixir", "Elixir", [".ex", ".exs"], "text/plain", true],
  ["clojure", "Clojure", [".clj", ".cljs", ".edn"], "text/x-clojure", true],
  ["erlang", "Erlang", [".erl", ".hrl"], "text/plain", true],
  ["fsharp", "F#", [".fs", ".fsi", ".fsx"], "text/plain", true],
  ["ocaml", "OCaml", [".ml", ".mli"], "text/plain", true],
  ["zig", "Zig", [".zig"], "text/plain", true],
  ["julia", "Julia", [".jl"], "text/plain", true],
  ["assembly", "Assembly", [".asm", ".s"], "text/plain", true],
  ["groovy", "Groovy", [".groovy", ".gradle"], "text/plain", true],
  ["visualbasic", "Visual Basic", [".vb", ".vbs"], "text/plain", true],
  ["matlab", "MATLAB", [".m"], "text/plain", true],
  ["fortran", "Fortran", [".f90", ".f95", ".f"], "text/plain", true],
  ["cobol", "COBOL", [".cob", ".cbl"], "text/plain", true],
  ["solidity", "Solidity", [".sol"], "text/plain", true],
  ["graphql", "GraphQL", [".graphql", ".gql"], "application/graphql", true],
  ["dockerfile", "Dockerfile", [".dockerfile"], "text/plain", true],
  ["makefile", "Makefile", [".mk"], "text/plain", true],
  ["toml", "TOML", [".toml"], "application/toml", true],
  ["ini", "Config / INI", [".ini", ".cfg", ".conf", ".env"], "text/plain", true],
  ["latex", "TeX / LaTeX", [".tex", ".bib"], "application/x-tex", true],
  ["vue", "Vue", [".vue"], "text/plain", true],
  ["svelte", "Svelte", [".svelte"], "text/plain", true],
  ["protobuf", "Protocol Buffers", [".proto"], "text/plain", true],
  ["diff", "Diff / Patch", [".diff", ".patch"], "text/plain", true],
  ["plaintext", "Plain Text", [".txt", ".log", ".csv", ".tsv"], "text/plain", false],
];

const EXT_MAP = new Map<string, LanguageInfo>();
const NAME_MAP = new Map<string, LanguageInfo>();

for (const [id, name, extensions, mimeType, isCode] of RAW_REGISTRY) {
  const info: LanguageInfo = { id, name, isCode, mimeType };
  for (const ext of extensions) {
    EXT_MAP.set(ext.toLowerCase(), info);
  }
}

// Special exact file name matches
const DOCKER_INFO: LanguageInfo = {
  id: "dockerfile",
  name: "Dockerfile",
  isCode: true,
  mimeType: "text/plain",
};
const MAKE_INFO: LanguageInfo = {
  id: "makefile",
  name: "Makefile",
  isCode: true,
  mimeType: "text/plain",
};

NAME_MAP.set("dockerfile", DOCKER_INFO);
NAME_MAP.set("makefile", MAKE_INFO);
NAME_MAP.set("gnumakefile", MAKE_INFO);

const DEFAULT_LANG: LanguageInfo = {
  id: "plaintext",
  name: "Plain Text",
  isCode: false,
  mimeType: "text/plain",
};

export const detectLanguage = (fileName?: string): LanguageInfo => {
  if (!fileName) return DEFAULT_LANG;
  const trimmed = fileName.trim().toLowerCase();
  if (NAME_MAP.has(trimmed)) {
    return NAME_MAP.get(trimmed) ?? DEFAULT_LANG;
  }
  const lastDot = trimmed.lastIndexOf(".");
  if (lastDot === -1) {
    return DEFAULT_LANG;
  }
  const ext = trimmed.slice(lastDot);
  return EXT_MAP.get(ext) ?? DEFAULT_LANG;
};

export const isCodeFile = (fileName?: string): boolean => {
  return detectLanguage(fileName).isCode;
};

export const getMimeTypeForFileName = (fileName?: string): string => {
  return detectLanguage(fileName).mimeType;
};

export const SUPPORTED_LANGUAGES_COUNT = RAW_REGISTRY.length;
