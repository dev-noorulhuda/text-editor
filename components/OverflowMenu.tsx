import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface OverflowMenuProps {
  isDark: boolean;
  fontSize: number;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onNew: () => void;
  onOpen: () => void;
  onRename: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onSettings: () => void;
}

export const OverflowMenu = ({
  isDark,
  fontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onNew,
  onOpen,
  onRename,
  onSave,
  onSaveAs,
  onSettings,
}: OverflowMenuProps) => {
  const [visible, setVisible] = useState(false);

  const iconColor = isDark ? colors.dark[200] : colors.white[600];
  const menuBg = isDark ? "bg-dark-600" : "bg-white-50";
  const menuBorder = isDark ? "border-dark-400" : "border-white-300";
  const textColor = isDark ? "text-dark-100" : "text-white-800";
  const subtleText = isDark ? "text-dark-200" : "text-white-600";
  const hoverBg = isDark ? "active:bg-dark-500" : "active:bg-white-200";
  const pillBg = isDark ? "bg-dark-500" : "bg-white-200";

  const items = [
    {
      label: "New",
      icon: <MaterialIcons name="note-add" size={18} color={iconColor} />,
      action: onNew,
    },
    {
      label: "Open",
      icon: <Feather name="folder" size={18} color={iconColor} />,
      action: onOpen,
    },
    {
      label: "Rename",
      icon: <Feather name="edit-3" size={18} color={iconColor} />,
      action: onRename,
    },
    {
      label: "Save",
      icon: <Feather name="save" size={18} color={iconColor} />,
      action: onSave,
    },
    {
      label: "Save As",
      icon: <Feather name="save" size={18} color={iconColor} />,
      action: onSaveAs,
    },
    {
      label: "Settings",
      icon: <Feather name="settings" size={18} color={iconColor} />,
      action: onSettings,
    },
  ];

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          buzz();
          setVisible(true);
        }}
        className="p-2"
      >
        <Feather name="more-vertical" size={20} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/20 justify-start items-end pt-14 pr-4"
          onPress={() => setVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={`rounded-lg border shadow-lg w-48 ${menuBg} ${menuBorder}`}
          >
            <View
              className={`flex-row items-center justify-between px-3 py-2.5 border-b ${menuBorder}`}
            >
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="format-size" size={18} color={iconColor} />
                <Text className={`text-xs font-medium ${subtleText}`}>
                  {fontSize}pts
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <TouchableOpacity
                  onPress={() => {
                    buzz();
                    onDecreaseFontSize();
                  }}
                  className={`p-1.5 rounded-md ${pillBg}`}
                >
                  <Feather name="minus" size={15} color={iconColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    buzz();
                    onIncreaseFontSize();
                  }}
                  className={`p-1.5 rounded-md ${pillBg}`}
                >
                  <Feather name="plus" size={15} color={iconColor} />
                </TouchableOpacity>
              </View>
            </View>

            {items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  buzz();
                  setVisible(false);
                  item.action();
                }}
                className={`flex-row items-center px-3 py-3 gap-3 ${
                  index === items.length - 1 ? "rounded-b-lg" : ""
                } ${hoverBg}`}
              >
                {item.icon}
                <Text className={`text-sm ${textColor}`}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
