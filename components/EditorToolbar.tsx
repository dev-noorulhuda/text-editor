import { OverflowMenu } from "@/components/OverflowMenu";
import { buzz } from "@/lib/haptics";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export interface EditorToolbarProps {
  isDark: boolean;
  iconColor: string;
  isEditable: boolean;
  fontSize: number;
  canUndo: boolean;
  canRedo: boolean;
  copied: boolean;
  onToggleEditable: () => void;
  onCopyAll: () => void;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onSettings: () => void;
}

export const EditorToolbar = ({
  isDark,
  iconColor,
  isEditable,
  fontSize,
  canUndo,
  canRedo,
  copied,
  onToggleEditable,
  onCopyAll,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onUndo,
  onRedo,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onSettings,
}: EditorToolbarProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="shrink"
      contentContainerClassName="flex-row items-center gap-0.5"
    >
      <TouchableOpacity
        onPress={() => {
          buzz();
          onToggleEditable();
        }}
        className="p-2"
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
          onCopyAll();
        }}
        className="p-2"
      >
        <Feather name={copied ? "check" : "copy"} size={18} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          buzz();
          onDecreaseFontSize();
        }}
        className="p-2"
      >
        <Feather name="minus" size={20} color={iconColor} />
      </TouchableOpacity>

      <Text
        className={`text-xs ${isDark ? "text-dark-200" : "text-white-600"}`}
      >
        {fontSize}pts
      </Text>

      <TouchableOpacity
        onPress={() => {
          buzz();
          onIncreaseFontSize();
        }}
        className="p-2"
      >
        <Feather name="plus" size={20} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          buzz();
          onUndo();
        }}
        disabled={!canUndo}
        className={`p-2 ${!canUndo ? "opacity-30" : ""}`}
      >
        <Feather name="corner-up-left" size={20} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          buzz();
          onRedo();
        }}
        disabled={!canRedo}
        className={`p-2 ${!canRedo ? "opacity-30" : ""}`}
      >
        <Feather name="corner-up-right" size={20} color={iconColor} />
      </TouchableOpacity>

      <OverflowMenu
        isDark={isDark}
        onNew={() => {
          buzz();
          onNew();
        }}
        onOpen={() => {
          buzz();
          onOpen();
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
    </ScrollView>
  );
};
