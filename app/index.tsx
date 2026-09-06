import { Editor } from "@/components/Editor";
import { EditorToolbar } from "@/components/EditorToolbar";
import { Tabs } from "@/components/Tabs";
import { UnsavedChangesModal } from "@/components/UnsavedChangesModal";
import { useEditor } from "@/hooks/useEditor";
import { colors } from "@/lib/colors";
import { detectLanguage } from "@/lib/languageRegistry";
import type { TabFile } from "@/types/editorTypes";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useState } from "react";
import { Clipboard, Keyboard, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditorScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    activeFile,
    activeFileId,
    files,
    canUndo,
    canRedo,
    isEditable,
    fontSize,
    fontFamily,
    highlightLine,
    showLineNumbers,
    wordWrap,
    edgeSpacing,
    openKeyboardAtStart,
    handleContentChange,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleUndo,
    handleRedo,
    handleClose,
    closingFile,
    handleDiscardClose,
    handleSaveClose,
    handleCancelClose,
    setActiveFileId,
    toggleEditable,
    increaseFontSize,
    decreaseFontSize,
  } = useEditor();

  const [prevActiveFileId, setPrevActiveFileId] = useState(activeFileId);
  const [currentLine, setCurrentLine] = useState(1);
  const [copied, setCopied] = useState(false);

  if (activeFileId !== prevActiveFileId) {
    setPrevActiveFileId(activeFileId);
    setCurrentLine(1);
  }

  const handleSelectionChange = useCallback((line: number) => {
    setCurrentLine(line);
  }, []);

  const handleToggleEditable = useCallback(() => {
    if (isEditable) {
      Keyboard.dismiss();
    }
    toggleEditable();
  }, [isEditable, toggleEditable]);

  const handleCopyAll = useCallback(async () => {
    const text = activeFile?.content ?? "";
    Clipboard.setString(text);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore if haptics unavailable
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [activeFile?.content]);

  const currentLang = detectLanguage(activeFile?.name);
  const isCode = currentLang.isCode;
  const effectiveFont =
    fontFamily === "system" && isCode ? "monospace" : fontFamily;

  const tabFiles: TabFile[] = files.map((f) => ({
    id: f.id,
    name: f.name,
    isModified: f.isModified,
  }));

  const canCopy = (activeFile?.content?.length ?? 0) > 0;
  const iconColor = isDark ? colors.dark[200] : colors.white[600];

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-500" : "bg-white-100"}`}
      edges={["top", "bottom"]}
    >
      <View
        className={`flex-row items-center justify-between px-4 py-3 ${
          isDark ? "bg-dark-600" : "bg-white-200"
        }`}
      >
        <View className="flex-row items-center gap-1.5 mr-2 shrink min-w-0 max-w-[45%]">
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            className={`text-base font-bold shrink min-w-0 ${
              isDark ? "text-dark-100" : "text-white-900"
            }`}
          >
            {activeFile?.name ?? "Untitled"}
          </Text>
          {isCode && (
            <View
              className={`px-1.5 py-0.5 rounded shrink-0 ${
                isDark ? "bg-dark-400" : "bg-white-300"
              }`}
            >
              <Text
                className={`text-[10px] font-semibold tracking-wider uppercase ${
                  isDark ? "text-dark-100" : "text-white-800"
                }`}
              >
                {currentLang.name}
              </Text>
            </View>
          )}
        </View>

        <EditorToolbar
          isDark={isDark}
          iconColor={iconColor}
          isEditable={isEditable}
          fontSize={fontSize}
          canUndo={canUndo}
          canRedo={canRedo}
          canCopy={canCopy}
          copied={copied}
          onToggleEditable={handleToggleEditable}
          onCopyAll={handleCopyAll}
          onDecreaseFontSize={decreaseFontSize}
          onIncreaseFontSize={increaseFontSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onSettings={() => router.push("/settings")}
        />
      </View>

      {/* The tab is wrapped by view is choice by the developer if we remove it it will break the ui so never do it no matter what */}
      <View className="">
        <Tabs
          files={tabFiles}
          activeFileId={activeFileId}
          isDark={isDark}
          onSelect={setActiveFileId}
          onClose={handleClose}
          onNew={handleNew}
        />
      </View>

      <Editor
        key={activeFileId}
        content={activeFile?.content ?? ""}
        isDark={isDark}
        editable={isEditable}
        fontSize={fontSize}
        fontFamily={effectiveFont}
        edgeSpacing={edgeSpacing}
        highlightLine={highlightLine}
        showLineNumbers={showLineNumbers}
        wordWrap={wordWrap}
        currentLine={currentLine}
        autoFocus={openKeyboardAtStart}
        onChangeText={handleContentChange}
        onSelectionChange={handleSelectionChange}
      />

      <UnsavedChangesModal
        visible={!!closingFile}
        fileName={closingFile?.name ?? ""}
        isDark={isDark}
        onCancel={handleCancelClose}
        onDiscard={handleDiscardClose}
        onSave={handleSaveClose}
      />
    </SafeAreaView>
  );
}
