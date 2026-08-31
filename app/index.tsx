import { useEffect, useState, useCallback } from "react";
import { View, TextInput, Alert, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import {
  autoSave,
  loadAutoSave,
  openFile,
  saveFile,
  saveFileAs,
} from "@/lib/fileHelpers";
import { SupportPrompt } from "@/components/SupportPrompt";

export default function EditorScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [content, setContent] = useState(() => loadAutoSave() ?? "");
  const [fileName, setFileName] = useState("Untitled");
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (content) {
      autoSave(content);
    }
  }, [content]);

  const handleOpen = useCallback(async () => {
    const result = await openFile();
    if (result.success && result.content !== undefined) {
      setContent(result.content);
      setFileName(result.fileName ?? "Untitled");
      setFileUri(null);
      setIsModified(false);
    } else if (result.error && result.error !== "User cancelled") {
      Alert.alert("Error", result.error);
    }
  }, []);

  const handleSaveAs = useCallback(async () => {
    const result = await saveFileAs(content);
    if (result.success) {
      setIsModified(false);
      Alert.alert("Saved", "File saved successfully");
    } else if (result.error && result.error !== "User cancelled") {
      Alert.alert("Error", result.error);
    }
  }, [content]);

  const handleSave = useCallback(async () => {
    if (!fileUri) {
      await handleSaveAs();
      return;
    }
    const result = await saveFile(content, fileUri);
    if (result.success) {
      setIsModified(false);
      Alert.alert("Saved", "File saved successfully");
    } else {
      Alert.alert("Error", result.error ?? "Failed to save");
    }
  }, [content, fileUri, handleSaveAs]);

  const handleNew = useCallback(() => {
    setContent("");
    setFileName("Untitled");
    setFileUri(null);
    setIsModified(false);
  }, []);

  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-500" : "bg-cream-100"}`}
      edges={["top", "bottom"]}
    >
      {/* Toolbar */}
      <View
        className={`flex-row items-center justify-between px-4 py-3 ${
          isDark ? "bg-dark-600" : "bg-cream-200"
        }`}
      >
        <View className="flex-row gap-2">
          <ToolbarButton
            label="New"
            onPress={handleNew}
            isDark={isDark}
          />
          <ToolbarButton
            label="Open"
            onPress={handleOpen}
            isDark={isDark}
          />
          <ToolbarButton
            label="Save"
            onPress={handleSave}
            isDark={isDark}
          />
          <ToolbarButton
            label="Save As"
            onPress={handleSaveAs}
            isDark={isDark}
          />
        </View>
        <TouchableOpacity onPress={toggleColorScheme}>
          <Text className={isDark ? "text-dark-200" : "text-cream-700"}>
            {isDark ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* File name */}
      <View
        className={`px-4 py-2 ${
          isDark ? "bg-dark-500" : "bg-cream-150"
        }`}
      >
        <Text
          className={`text-sm ${
            isDark ? "text-dark-300" : "text-cream-600"
          }`}
        >
          {fileName}
          {isModified ? " •" : ""}
        </Text>
      </View>

      {/* Editor */}
      <TextInput
        className={`flex-1 px-4 py-3 text-base ${
          isDark
            ? "bg-dark-500 text-dark-50"
            : "bg-cream-50 text-cream-900"
        }`}
        multiline
        value={content}
        onChangeText={(text) => {
          setContent(text);
          setIsModified(true);
        }}
        placeholder="Start typing..."
        placeholderTextColor={isDark ? "#75757B" : "#D4C494"}
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <SupportPrompt isDark={isDark} />
    </SafeAreaView>
  );
}

function ToolbarButton({
  label,
  onPress,
  isDark,
}: {
  label: string;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-2 rounded-lg ${
        isDark ? "bg-dark-400" : "bg-cream-300"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isDark ? "text-dark-100" : "text-cream-800"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
