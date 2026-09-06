import { Editor } from "@/components/Editor";
import { OverflowMenu } from "@/components/OverflowMenu";
import { Tabs } from "@/components/Tabs";
import { useEditor } from "@/hooks/useEditor";
import { colors } from "@/lib/colors";
import { detectLanguage } from "@/lib/languageRegistry";
import type { TabFile } from "@/types/editorTypes";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useState } from "react";
import { Clipboard, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditorScreen() {
  const { colorScheme, toggleColorScheme: toggleNativewind } = useColorScheme();
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
    setActiveFileId,
    toggleEditable,
    increaseFontSize,
    decreaseFontSize,
    toggleColorScheme: togglePersisted,
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

  const handleToggleColorScheme = () => {
    toggleNativewind();
    togglePersisted();
  };

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
        <View className="flex-row items-center gap-2">
          <Text
            className={`text-lg font-bold ${
              isDark ? "text-dark-100" : "text-white-900"
            }`}
          >
            Text Editor
          </Text>
          {isCode && (
            <View
              className={`px-1.5 py-0.5 rounded ${
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

        <View className="flex-row items-center gap-1">
          <TouchableOpacity onPress={handleToggleEditable} className="p-2">
            <MaterialIcons
              name={isEditable ? "edit" : "edit-off"}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCopyAll} className="p-2">
            <Feather
              name={copied ? "check" : "copy"}
              size={18}
              color={iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={decreaseFontSize} className="p-2">
            <Feather name="minus" size={20} color={iconColor} />
          </TouchableOpacity>

          <Text
            className={`text-xs ${isDark ? "text-dark-200" : "text-white-600"}`}
          >
            {fontSize}pts
          </Text>

          <TouchableOpacity onPress={increaseFontSize} className="p-2">
            <Feather name="plus" size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUndo}
            disabled={!canUndo}
            className={`p-2 ${!canUndo ? "opacity-30" : ""}`}
          >
            <Feather name="corner-up-left" size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedo}
            disabled={!canRedo}
            className={`p-2 ${!canRedo ? "opacity-30" : ""}`}
          >
            <Feather name="corner-up-right" size={20} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleToggleColorScheme} className="p-2">
            <MaterialIcons
              name={isDark ? "light-mode" : "dark-mode"}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>

          <OverflowMenu
            isDark={isDark}
            onNew={handleNew}
            onOpen={handleOpen}
            onSave={handleSave}
            onSaveAs={handleSaveAs}
            onSettings={() => router.push("/settings")}
          />
        </View>
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
    </SafeAreaView>
  );
}
