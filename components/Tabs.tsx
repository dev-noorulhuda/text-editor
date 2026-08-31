import type { TabsProps } from "@/types/editorTypes";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export const Tabs = ({
  files,
  activeFileId,
  isDark,
  onSelect,
  onClose,
  onNew,
}: TabsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`${isDark ? "bg-dark-500" : "bg-white-200"}`}
    >
      {files.map((file) => {
        const isActive = file.id === activeFileId;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            key={file.id}
            onPress={() => onSelect(file.id)}
            className={`h-9 flex-row items-center px-3 ${
              isActive
                ? isDark
                  ? "border-b-2 border-dark-50 bg-dark-600"
                  : "border-b-2 border-white-400 bg-white-50"
                : ""
            }`}
          >
            <Text
              className={`text-xs mr-2 ${
                isActive
                  ? isDark
                    ? "text-dark-50"
                    : "text-white-900"
                  : isDark
                    ? "text-dark-300"
                    : "text-white-600"
              }`}
            >
              {file.name}
              {file.isModified ? " •" : ""}
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onClose(file.id);
              }}
            >
              <Text
                className={`text-xs ${
                  isDark ? "text-dark-400" : "text-white-500"
                }`}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity onPress={onNew} className="h-9 px-3 justify-center">
        <Text
          className={`text-base font-bold ${
            isDark ? "text-dark-300" : "text-white-600"
          }`}
        >
          +
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
