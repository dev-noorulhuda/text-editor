import { colors } from "@/lib/colors";
import { buzz } from "@/lib/haptics";
import { Feather } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export interface FindReplaceBarProps {
  isDark: boolean;
  isEditable: boolean;
  query: string;
  replacement: string;
  showReplace: boolean;
  caseSensitive: boolean;
  matchCount: number;
  activeIndex: number;
  onChangeQuery: (text: string) => void;
  onChangeReplacement: (text: string) => void;
  onToggleReplace: () => void;
  onToggleCaseSensitive: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const FindReplaceBar = ({
  isDark,
  isEditable,
  query,
  replacement,
  showReplace,
  caseSensitive,
  matchCount,
  activeIndex,
  onChangeQuery,
  onChangeReplacement,
  onToggleReplace,
  onToggleCaseSensitive,
  onNext,
  onPrev,
  onReplace,
  onReplaceAll,
  onClose,
}: FindReplaceBarProps) => {
  const barBg = isDark ? "bg-dark-600" : "bg-white-200";
  const borderCol = isDark ? "border-dark-400" : "border-white-300";
  const inputBg = isDark ? "bg-dark-500" : "bg-white-50";
  const textPrimary = isDark ? "text-dark-100" : "text-white-900";
  const textSecondary = isDark ? "text-dark-300" : "text-white-600";
  const iconColor = isDark ? colors.dark[200] : colors.white[600];
  const placeholderColor = isDark ? colors.dark[300] : colors.white[500];
  const activeChipBg = isDark ? "bg-dark-400" : "bg-white-300";
  const actionBg = isDark ? "bg-dark-500" : "bg-white-50";

  const hasMatches = matchCount > 0;
  const canReplace = isEditable && hasMatches;
  const counterText = query
    ? hasMatches
      ? `${activeIndex + 1}/${matchCount}`
      : "0/0"
    : "";

  return (
    <View className={`px-2.5 py-2 border-b gap-2 ${barBg} ${borderCol}`}>
      {/* Find Row */}
      <View className="flex-row items-center gap-1.5">
        <TouchableOpacity
          onPress={() => {
            buzz();
            onToggleReplace();
          }}
          className="p-1"
        >
          <Feather
            name={showReplace ? "chevron-down" : "chevron-right"}
            size={18}
            color={iconColor}
          />
        </TouchableOpacity>

        <View
          className={`flex-1 flex-row items-center rounded-md border px-2.5 h-9 ${inputBg} ${borderCol}`}
        >
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Find..."
            placeholderTextColor={placeholderColor}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onNext}
            className={`flex-1 text-sm py-0 ${textPrimary}`}
          />
          {counterText ? (
            <Text className={`text-xs ml-1.5 ${textSecondary}`}>
              {counterText}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onToggleCaseSensitive();
          }}
          className={`px-2 h-9 rounded-md items-center justify-center border ${borderCol} ${
            caseSensitive ? activeChipBg : inputBg
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              caseSensitive ? textPrimary : textSecondary
            }`}
          >
            Aa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onPrev();
          }}
          disabled={!hasMatches}
          className={`p-1.5 ${!hasMatches ? "opacity-30" : ""}`}
        >
          <Feather name="chevron-up" size={18} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onNext();
          }}
          disabled={!hasMatches}
          className={`p-1.5 ${!hasMatches ? "opacity-30" : ""}`}
        >
          <Feather name="chevron-down" size={18} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            buzz();
            onClose();
          }}
          className="p-1.5"
        >
          <Feather name="x" size={18} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Replace Row */}
      {showReplace && (
        <View className="flex-row items-center gap-1.5 pl-7">
          <View
            className={`flex-1 flex-row items-center rounded-md border px-2.5 h-9 ${inputBg} ${borderCol}`}
          >
            <TextInput
              value={replacement}
              onChangeText={onChangeReplacement}
              placeholder="Replace..."
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onReplace}
              className={`flex-1 text-sm py-0 ${textPrimary}`}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              buzz();
              onReplace();
            }}
            disabled={!canReplace}
            className={`px-2.5 h-9 rounded-md border items-center justify-center ${actionBg} ${borderCol} ${
              !canReplace ? "opacity-35" : ""
            }`}
          >
            <Text className={`text-xs font-semibold ${textPrimary}`}>
              Replace
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              buzz();
              onReplaceAll();
            }}
            disabled={!canReplace}
            className={`px-2.5 h-9 rounded-md border items-center justify-center ${actionBg} ${borderCol} ${
              !canReplace ? "opacity-35" : ""
            }`}
          >
            <Text className={`text-xs font-semibold ${textPrimary}`}>All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default FindReplaceBar;
