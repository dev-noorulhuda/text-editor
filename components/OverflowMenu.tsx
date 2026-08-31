import { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Pressable,
} from "react-native";
import {
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { colors } from "@/lib/colors";

interface OverflowMenuProps {
  isDark: boolean;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
}

export const OverflowMenu = ({
  isDark,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
}: OverflowMenuProps) => {
  const [visible, setVisible] = useState(false);

  const iconColor = isDark ? colors.dark[200] : colors.white[600];
  const menuBg = isDark ? "bg-dark-600" : "bg-white-50";
  const menuBorder = isDark ? "border-dark-400" : "border-white-300";
  const textColor = isDark ? "text-dark-100" : "text-white-800";
  const hoverBg = isDark ? "bg-dark-500" : "bg-white-100";

  const items = [
    { label: "New", icon: <MaterialIcons name="note-add" size={18} color={iconColor} />, action: onNew },
    { label: "Open", icon: <Feather name="folder" size={18} color={iconColor} />, action: onOpen },
    { label: "Save", icon: <Feather name="save" size={18} color={iconColor} />, action: onSave },
    { label: "Save As", icon: <Feather name="save" size={18} color={iconColor} />, action: onSaveAs },
  ];

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(!visible)}
        className="p-2"
      >
        <Feather name="more-vertical" size={20} color={iconColor} />
      </TouchableOpacity>

      {visible && (
        <Pressable
          className="absolute top-10 right-0 z-50"
          onPress={() => setVisible(false)}
        >
          <View className="flex-1 bg-black/20" />
        </Pressable>
      )}

      {visible && (
        <View
          className={`absolute top-10 right-0 z-50 rounded-lg border shadow-lg w-40 ${menuBg} ${menuBorder}`}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => {
                item.action();
                setVisible(false);
              }}
              className={`flex-row items-center px-3 py-3 gap-3 ${
                index === 0 ? "rounded-t-lg" : ""
              } ${index === items.length - 1 ? "rounded-b-lg" : ""} ${hoverBg}`}
            >
              {item.icon}
              <Text className={`text-sm ${textColor}`}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
