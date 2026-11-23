import { Editor } from "@/components/Editor";
import { EditorToolbar } from "@/components/EditorToolbar";
import { FindReplaceBar } from "@/components/FindReplaceBar";
import { RenameFileModal } from "@/components/RenameFileModal";
import { Snackbar } from "@/components/Snackbar";
import { Tabs } from "@/components/Tabs";
import { UnsavedChangesModal } from "@/components/UnsavedChangesModal";
import { useEditor } from "@/hooks/useEditor";
import { useFindReplace } from "@/hooks/useFindReplace";
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
  const editor = useEditor();
  const { snackbar, showNotice, showReadOnlyNotice } = useSnackbar();

  const [prevActiveFileId, setPrevActiveFileId] = useState(editor.activeFileId);
  const [currentLine, setCurrentLine] = useState(1);
  const [copied, setCopied] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);

  if (editor.activeFileId !== prevActiveFileId) {
    setPrevActiveFileId(editor.activeFileId);
    setCurrentLine(1);
  }

  const handleSelectionChange = useCallback((line: number) => {
    setCurrentLine(line);
  }, []);

  const find = useFindReplace({
    content: editor.activeFile?.content ?? "",
    isEditable: editor.isEditable,
    onContentChange: editor.handleContentChange,
    onJumpToLine: handleSelectionChange,
    onReadOnlyNotice: showReadOnlyNotice,
    onNotify: showNotice,
  });

  const handleSavePress = useCallback(async () => {
    const outcome = await editor.handleSave();
    if (outcome === "saved" || outcome === "saved_as") showNotice("File saved");
  }, [editor, showNotice]);

  const handleSaveAsPress = useCallback(async () => {
    if ((await editor.handleSaveAs()) === "saved_as") showNotice("File saved");
  }, [editor, showNotice]);

  const handleConfirmRename = useCallback(
    (newName: string) => {
      setRenameVisible(false);
      if (editor.handleRename(newName)) showNotice(`Renamed to ${newName}`);
    },
    [editor, showNotice],
  );

  const handleClear = useCallback(() => {
    editor.handleContentChange("");
    setCurrentLine(1);
  }, [editor]);

  const handleToggleEditable = useCallback(() => {
    if (editor.isEditable) Keyboard.dismiss();
    editor.toggleEditable();
  }, [editor]);

  const handleCopyAll = useCallback(async () => {
    Clipboard.setString(editor.activeFile?.content ?? "");
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore if haptics unavailable
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [editor.activeFile?.content]);

  const isCode = detectLanguage(editor.activeFile?.name).isCode;
  const effectiveFont =
    editor.fontFamily === "system" && isCode ? "monospace" : editor.fontFamily;
  const tabFiles: TabFile[] = editor.files.map((f) => ({
    id: f.id,
    name: f.name,
    isModified: f.isModified,
  }));
  const canCopy = (editor.activeFile?.content?.length ?? 0) > 0;
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
            {editor.activeFile?.name || "Untitled"}
          </Text>
        </TouchableOpacity>

        <EditorToolbar
          isDark={isDark}
          iconColor={iconColor}
          isEditable={editor.isEditable}
          isFindOpen={find.isOpen}
          fontSize={editor.fontSize}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          canCopy={canCopy}
          copied={copied}
          onToggleEditable={handleToggleEditable}
          onToggleFind={find.toggleFind}
          onCopyAll={handleCopyAll}
          onClear={handleClear}
          onDecreaseFontSize={editor.decreaseFontSize}
          onIncreaseFontSize={editor.increaseFontSize}
          onUndo={editor.handleUndo}
          onRedo={editor.handleRedo}
          onNew={editor.handleNew}
          onOpen={editor.handleOpen}
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
          activeFileId={editor.activeFileId}
          isDark={isDark}
          onSelect={editor.setActiveFileId}
          onClose={editor.handleClose}
          onNew={editor.handleNew}
        />
      </View>

      {find.isOpen && (
        <FindReplaceBar
          isDark={isDark}
          isEditable={editor.isEditable}
          query={find.query}
          replacement={find.replacement}
          showReplace={find.showReplace}
          caseSensitive={find.caseSensitive}
          matchCount={find.matches.length}
          activeIndex={find.activeIndex}
          onChangeQuery={find.setQuery}
          onChangeReplacement={find.setReplacement}
          onToggleReplace={find.toggleReplace}
          onToggleCaseSensitive={find.toggleCaseSensitive}
          onNext={find.nextMatch}
          onPrev={find.prevMatch}
          onReplace={find.handleReplace}
          onReplaceAll={find.handleReplaceAll}
          onClose={find.closeFind}
        />
      )}

      <Editor
        key={editor.activeFileId}
        content={editor.activeFile?.content ?? ""}
        isDark={isDark}
        editable={editor.isEditable}
        fontSize={editor.fontSize}
        fontFamily={effectiveFont}
        edgeSpacing={editor.edgeSpacing}
        highlightLine={editor.highlightLine}
        showLineNumbers={editor.showLineNumbers}
        wordWrap={editor.wordWrap}
        currentLine={currentLine}
        autoFocus={editor.openKeyboardAtStart}
        searchMatches={find.matches}
        activeMatchIndex={find.activeIndex}
        onChangeText={editor.handleContentChange}
        onSelectionChange={handleSelectionChange}
        onReadOnlyNotice={showReadOnlyNotice}
      />

      <RenameFileModal
        visible={renameVisible}
        currentName={editor.activeFile?.name ?? "Untitled"}
        isDark={isDark}
        onCancel={() => setRenameVisible(false)}
        onConfirm={handleConfirmRename}
      />

      <UnsavedChangesModal
        visible={!!editor.closingFile}
        fileName={editor.closingFile?.name ?? ""}
        isDark={isDark}
        onCancel={editor.handleCancelClose}
        onDiscard={editor.handleDiscardClose}
        onSave={editor.handleSaveClose}
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
