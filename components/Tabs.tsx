import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import type { TabsProps } from "@/types/editorTypes";
import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
          <View
            key={file.id}
            className={`h-9 flex-row items-center ${
              isActive
                ? isDark
                  ? "border-b-2 border-dark-50 bg-dark-600"
                  : "border-b-2 border-white-400 bg-white-50"
                : ""
            }`}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                buzz();
                onSelect(file.id);
              }}
              className="h-full flex-row items-center pl-3 pr-1.5"
            >
              <Text
                className={`text-xs ${
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
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
              onPress={() => {
                buzz();
                onClose(file.id);
              }}
              className="h-full px-2.5 justify-center items-center"
            >
              <Feather
                name="x"
                size={14}
                color={
                  isActive
                    ? isDark
                      ? colors.dark[200]
                      : colors.white[600]
                    : isDark
                      ? colors.dark[400]
                      : colors.white[400]
                }
              />
            </TouchableOpacity>
          </View>
        );
      })}
      <TouchableOpacity
        onPress={() => {
          buzz();
          onNew();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="h-9 px-4 justify-center items-center"
      >
        <Feather
          name="plus"
          size={16}
          color={isDark ? colors.dark[300] : colors.white[600]}
        />
      </TouchableOpacity>
    </ScrollView>
  );
};
