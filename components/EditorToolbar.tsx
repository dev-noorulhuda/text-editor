import { OverflowMenu } from "@/components/OverflowMenu";
import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";

export interface EditorToolbarProps {
  isDark: boolean;
  iconColor: string;
  isEditable: boolean;
  isFindOpen: boolean;
  fontSize: number;
  canUndo: boolean;
  canRedo: boolean;
  canCopy: boolean;
  copied: boolean;
  onToggleEditable: () => void;
  onToggleFind: () => void;
  onCopyAll: () => void;
  onClear: () => void;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onNew: () => void;
  onOpen: () => void;
  onRename: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onSettings: () => void;
}

export const EditorToolbar = ({
  isDark,
  iconColor,
  isEditable,
  isFindOpen,
  fontSize,
  canUndo,
  canRedo,
  canCopy,
  copied,
  onToggleEditable,
  onToggleFind,
  onCopyAll,
  onClear,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onUndo,
  onRedo,
  onNew,
  onOpen,
  onRename,
  onSave,
  onSaveAs,
  onSettings,
}: EditorToolbarProps) => {
  const canClear = isEditable && canCopy;

  return (
    <View className="flex-row items-center shrink justify-end">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="shrink"
        contentContainerClassName="flex-row items-center gap-0.5 justify-end flex-1"
      >
        <TouchableOpacity
          onPress={() => {
            buzz();
            onCopyAll();
          }}
          disabled={!canCopy}
          className={`p-1.5 ${!canCopy ? "opacity-30" : ""}`}
        >
          <Feather
            name={copied ? "check" : "copy"}
            size={18}
            color={iconColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onToggleFind();
          }}
          className={`p-1.5 rounded-md ${
            isFindOpen ? (isDark ? "bg-dark-500" : "bg-white-300") : ""
          }`}
        >
          <Feather
            name="search"
            size={18}
            color={
              isFindOpen
                ? isDark
                  ? colors.link.dark
                  : colors.link.light
                : iconColor
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onUndo();
          }}
          disabled={!canUndo}
          className={`p-1.5 ${!canUndo ? "opacity-30" : ""}`}
        >
          <Feather name="corner-up-left" size={20} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onRedo();
          }}
          disabled={!canRedo}
          className={`p-1.5 ${!canRedo ? "opacity-30" : ""}`}
        >
          <Feather name="corner-up-right" size={20} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onToggleEditable();
          }}
          className="p-1.5"
        >
          <MaterialIcons
            name={isEditable ? "edit" : "edit-off"}
            size={20}
            color={iconColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onClear();
          }}
          disabled={!canClear}
          className={`p-1.5 ${!canClear ? "opacity-30" : ""}`}
        >
          <MaterialIcons name="cleaning-services" size={19} color={iconColor} />
        </TouchableOpacity>
      </ScrollView>

      <OverflowMenu
        isDark={isDark}
        fontSize={fontSize}
        onDecreaseFontSize={onDecreaseFontSize}
        onIncreaseFontSize={onIncreaseFontSize}
        onNew={() => {
          buzz();
          onNew();
        }}
        onOpen={() => {
          buzz();
          onOpen();
        }}
        onRename={() => {
          buzz();
          onRename();
        }}
        onSave={() => {
          buzz();
          onSave();
        }}
        onSaveAs={() => {
          buzz();
          onSaveAs();
        }}
        onSettings={() => {
          buzz();
          onSettings();
        }}
      />
    </View>
  );
};
