import {
  SUPPORTED_LANGUAGES_COUNT,
  detectLanguage,
  getMimeTypeForFileName,
  isCodeFile,
} from "../lib/languageRegistry";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// 1. Language count
assert(
  SUPPORTED_LANGUAGES_COUNT >= 50,
  `Expected at least 50 supported languages, got ${SUPPORTED_LANGUAGES_COUNT}`,
);

// 2. User requested languages
assert(detectLanguage("index.html").id === "html", "html failed");
assert(detectLanguage("styles.css").id === "css", "css failed");
assert(detectLanguage("app.js").id === "javascript", "js failed");
assert(detectLanguage("main.rs").id === "rust", "rust failed");
assert(detectLanguage("script.py").id === "python", "python failed");
assert(detectLanguage("game.lua").id === "lua", "lua failed");
assert(detectLanguage("main.c").id === "c", "c failed");
assert(detectLanguage("main.cpp").id === "cpp", "cpp failed");
assert(detectLanguage("Main.java").id === "java", "java failed");
assert(detectLanguage("Program.cs").id === "csharp", "c# failed");
assert(detectLanguage("analysis.r").id === "r", "r failed");
assert(detectLanguage("app.ts").id === "typescript", "ts failed");
assert(detectLanguage("App.tsx").id === "typescript", "tsx failed");

// 3. Top 50+ list verification
const testFiles: [string, string][] = [
  ["main.go", "go"],
  ["app.swift", "swift"],
  ["MainActivity.kt", "kotlin"],
  ["index.php", "php"],
  ["app.rb", "ruby"],
  ["query.sql", "sql"],
  ["package.json", "json"],
  ["config.yaml", "yaml"],
  ["data.xml", "xml"],
  ["README.md", "markdown"],
  ["deploy.sh", "shell"],
  ["run.ps1", "powershell"],
  ["build.bat", "batch"],
  ["main.dart", "dart"],
  ["Server.scala", "scala"],
  ["script.pl", "perl"],
  ["Main.hs", "haskell"],
  ["router.ex", "elixir"],
  ["core.clj", "clojure"],
  ["server.erl", "erlang"],
  ["Program.fs", "fsharp"],
  ["main.ml", "ocaml"],
  ["main.zig", "zig"],
  ["model.jl", "julia"],
  ["boot.asm", "assembly"],
  ["build.gradle", "groovy"],
  ["macro.vb", "visualbasic"],
  ["sim.m", "matlab"],
  ["calc.f90", "fortran"],
  ["account.cob", "cobol"],
  ["Token.sol", "solidity"],
  ["schema.graphql", "graphql"],
  ["Dockerfile", "dockerfile"],
  ["Makefile", "makefile"],
  ["Cargo.toml", "toml"],
  [".env", "ini"],
  ["document.tex", "latex"],
  ["App.vue", "vue"],
  ["Component.svelte", "svelte"],
  ["service.proto", "protobuf"],
  ["changes.diff", "diff"],
];

for (const [file, expectedId] of testFiles) {
  const result = detectLanguage(file);
  assert(
    result.id === expectedId,
    `File ${file} expected ${expectedId}, got ${result.id}`,
  );
  assert(result.isCode === true, `File ${file} should be code`);
}

// 4. Code vs Plain Text
assert(isCodeFile("App.tsx") === true, "App.tsx should be code");
assert(isCodeFile("notes.txt") === false, "notes.txt should not be code");
assert(isCodeFile("out.log") === false, "out.log should not be code");
assert(isCodeFile("Untitled") === false, "Untitled should not be code");

// 5. MIME Types
assert(getMimeTypeForFileName("index.html") === "text/html", "html mime failed");
assert(getMimeTypeForFileName("styles.css") === "text/css", "css mime failed");
assert(getMimeTypeForFileName("script.py") === "text/x-python", "py mime failed");
assert(getMimeTypeForFileName("main.rs") === "text/x-rust", "rs mime failed");
assert(getMimeTypeForFileName("notes.txt") === "text/plain", "txt mime failed");

console.log("All language registry and reading tests passed successfully!");
