import { Editor } from "@/components/Editor";
import { EditorToolbar } from "@/components/EditorToolbar";
import { RenameFileModal } from "@/components/RenameFileModal";
import { Snackbar } from "@/components/Snackbar";
import { Tabs } from "@/components/Tabs";
import { UnsavedChangesModal } from "@/components/UnsavedChangesModal";
import { useEditor } from "@/hooks/useEditor";
import { useSnackbar } from "@/hooks/useSnackbar";
import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import { detectLanguage } from "@/lib/languageRegistry";
import type { TabFile } from "@/types/editorTypes";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useState } from "react";
import { Clipboard, Keyboard, Text, TouchableOpacity, View } from "react-native";
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
    handleRename,
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

  const { snackbar, showNotice, showReadOnlyNotice } = useSnackbar();
  const [prevActiveFileId, setPrevActiveFileId] = useState(activeFileId);
  const [currentLine, setCurrentLine] = useState(1);
  const [copied, setCopied] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);

  const handleSavePress = useCallback(async () => {
    const outcome = await handleSave();
    if (outcome === "saved" || outcome === "saved_as") {
      showNotice("File saved");
    }
  }, [handleSave, showNotice]);

  const handleSaveAsPress = useCallback(async () => {
    const outcome = await handleSaveAs();
    if (outcome === "saved_as") {
      showNotice("File saved");
    }
  }, [handleSaveAs, showNotice]);

  const handleConfirmRename = useCallback(
    (newName: string) => {
      setRenameVisible(false);
      if (handleRename(newName)) {
        showNotice(`Renamed to ${newName}`);
      }
    },
    [handleRename, showNotice],
  );

  const handleClear = useCallback(() => {
    handleContentChange("");
  }, [handleContentChange]);

  if (activeFileId !== prevActiveFileId) {
    setPrevActiveFileId(activeFileId);
    setCurrentLine(1);
  }

  const handleSelectionChange = useCallback((line: number) => {
    setCurrentLine(line);
  }, []);

  const handleToggleEditable = useCallback(() => {
    if (isEditable) Keyboard.dismiss();
    toggleEditable();
  }, [isEditable, toggleEditable]);

  const handleCopyAll = useCallback(async () => {
    Clipboard.setString(activeFile?.content ?? "");
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore if haptics unavailable
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [activeFile?.content]);

  const isCode = detectLanguage(activeFile?.name).isCode;
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            buzz();
            setRenameVisible(true);
          }}
          className="shrink-0 max-w-[42%] mr-2 justify-center"
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            className={`text-base font-bold ${
              isDark ? "text-dark-100" : "text-white-900"
            }`}
          >
            {activeFile?.name || "Untitled"}
          </Text>
        </TouchableOpacity>

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
          onClear={handleClear}
          onDecreaseFontSize={decreaseFontSize}
          onIncreaseFontSize={increaseFontSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onNew={handleNew}
          onOpen={handleOpen}
          onRename={() => setRenameVisible(true)}
          onSave={handleSavePress}
          onSaveAs={handleSaveAsPress}
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
        onReadOnlyNotice={showReadOnlyNotice}
      />

      <RenameFileModal
        visible={renameVisible}
        currentName={activeFile?.name ?? "Untitled"}
        isDark={isDark}
        onCancel={() => setRenameVisible(false)}
        onConfirm={handleConfirmRename}
      />

      <UnsavedChangesModal
        visible={!!closingFile}
        fileName={closingFile?.name ?? ""}
        isDark={isDark}
        onCancel={handleCancelClose}
        onDiscard={handleDiscardClose}
        onSave={handleSaveClose}
      />

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        icon={snackbar.icon}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
