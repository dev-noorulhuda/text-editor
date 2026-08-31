import { Editor } from "@/components/Editor";
import { OverflowMenu } from "@/components/OverflowMenu";
import { Tabs } from "@/components/Tabs";
import { useEditor } from "@/hooks/useEditor";
import type { TabFile } from "@/types/editorTypes";
import { MaterialIcons } from "@expo/vector-icons";
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
    handleContentChange,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleClose,
    setActiveFileId,
  } = useEditor();

  const tabFiles: TabFile[] = files.map((f) => ({
    id: f.id,
    name: f.name,
    isModified: f.isModified,
  }));

  const iconColor = isDark ? "#A3A3A7" : "#D4C494";

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-500" : "bg-cream-100"}`}
      edges={["top", "bottom"]}
    >
      <View
        className={`flex-row items-center justify-between px-4 py-3 ${
          isDark ? "bg-dark-600" : "bg-cream-200"
        }`}
      >
        <Text
          className={`text-lg font-bold ${
            isDark ? "text-dark-100" : "text-cream-800"
          }`}
        >
          Text Editor
        </Text>

        <View className="flex-row items-center gap-1">
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
        onChangeText={handleContentChange}
      />
    </SafeAreaView>
  );
}
