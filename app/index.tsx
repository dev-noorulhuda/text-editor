import { Editor } from "@/components/Editor";
import { OverflowMenu } from "@/components/OverflowMenu";
import { Tabs } from "@/components/Tabs";
import { useEditor } from "@/hooks/useEditor";
import { colors } from "@/lib/colors";
import type { TabFile } from "@/types/editorTypes";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { TouchableOpacity, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditorScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    activeFile,
    activeFileId,
    files,
    canUndo,
    canRedo,
    isEditable,
    fontSize,
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
  } = useEditor();

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
        <Text
          className={`text-lg font-bold ${
            isDark ? "text-dark-100" : "text-white-900"
          }`}
        >
          Text Editor
        </Text>

        <View className="flex-row items-center gap-1">
          <TouchableOpacity onPress={toggleEditable} className="p-2">
            <MaterialIcons
              name={isEditable ? "edit" : "edit-off"}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={decreaseFontSize} className="p-2">
            <Feather name="minus" size={20} color={iconColor} />
          </TouchableOpacity>

          <Text className={`text-xs ${isDark ? "text-dark-200" : "text-white-600"}`}>
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
            <Feather
              name="corner-up-left"
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedo}
            disabled={!canRedo}
            className={`p-2 ${!canRedo ? "opacity-30" : ""}`}
          >
            <Feather
              name="corner-up-right"
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleColorScheme} className="p-2">
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
        content={activeFile?.content ?? ""}
        isDark={isDark}
        editable={isEditable}
        fontSize={fontSize}
        onChangeText={handleContentChange}
      />
    </SafeAreaView>
  );
}
