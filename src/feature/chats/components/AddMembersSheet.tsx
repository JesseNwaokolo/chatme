import { Avatar } from "@/src/shared/components/Avatar";
import { Button } from "@/src/shared/components/Button";
import { StyledText } from "@/src/shared/components/StyledText";
import { SearchIcon } from "@/src/shared/icons";
import { fonts } from "@/src/theme/fonts";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAddGroupMembers } from "../api/useConversationActions";
import { useChats } from "../api/useChats";
import { Chat } from "../types";

export interface AddMembersSheetRef {
  present: () => void;
}

interface AddMembersSheetProps {
  conversationId: string;
  existingMemberIds: string[];
}

const COLUMNS = 4;
const SNAP_POINTS = ["80%"];

export const AddMembersSheet = forwardRef<AddMembersSheetRef, AddMembersSheetProps>(
  ({ conversationId, existingMemberIds }, ref) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);

    const [query, setQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: conversations, isLoading } = useChats();
    const addMembers = useAddGroupMembers(conversationId);

    useImperativeHandle(ref, () => ({ present: () => sheetRef.current?.present() }));

    const candidates = useMemo(() => {
      const seen = new Set<string>(existingMemberIds);
      return (conversations ?? []).filter((chat) => {
        if (chat.isGroup || seen.has(chat.participantId)) return false;
        seen.add(chat.participantId);
        return true;
      });
    }, [conversations, existingMemberIds]);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return q ? candidates.filter((p) => p.name.toLowerCase().includes(q)) : candidates;
    }, [candidates, query]);

    const toggle = (id: string) =>
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const reset = () => {
      setQuery("");
      setSelectedIds([]);
    };

    const handleAdd = () => {
      if (selectedIds.length === 0) return;
      addMembers.mutate(selectedIds, {
        onSuccess: () => sheetRef.current?.dismiss(),
        onError: (error) =>
          Toast.show({
            type: "error",
            text1: "Couldn't add members",
            text2: error instanceof Error ? error.message : undefined,
          }),
      });
    };

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
      ),
      [],
    );

    const renderPerson = ({ item }: { item: Chat }) => {
      const selected = selectedIds.includes(item.participantId);
      return (
        <Pressable style={styles.person} onPress={() => toggle(item.participantId)}>
          <View style={[styles.avatarRing, selected && styles.avatarRingSelected]}>
            <Avatar name={item.name} imageUrl={item.avatarUrl} size={56} />
            {selected && (
              <View style={styles.check}>
                <StyledText size={12} weight="bold" style={{ color: theme.buttonPrimaryText }}>
                  ✓
                </StyledText>
              </View>
            )}
          </View>
          <StyledText size={13} weight="medium" numberOfLines={1} style={{ color: theme.textPrimary }}>
            {item.name}
          </StyledText>
        </Pressable>
      );
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={SNAP_POINTS}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={reset}
        backgroundStyle={{ backgroundColor: theme.bgNeutral }}
        handleIndicatorStyle={{ backgroundColor: theme.border2 }}
      >
        <View style={styles.content}>
          <StyledText weight="bold" size={18} style={styles.title}>
            Add members
            {selectedIds.length > 0 && (
              <StyledText weight="bold" size={18} style={{ color: theme.buttonPrimary }}>
                {` (${selectedIds.length})`}
              </StyledText>
            )}
          </StyledText>

          <View style={styles.searchBar}>
            <SearchIcon size={18} color={theme.textTertiary} />
            <BottomSheetTextInput
              placeholder="Search people..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>

          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={theme.buttonPrimary} />
            </View>
          ) : (
            <BottomSheetFlatList
              data={filtered}
              keyExtractor={(item: Chat) => item.participantId}
              renderItem={renderPerson}
              numColumns={COLUMNS}
              columnWrapperStyle={styles.column}
              contentContainerStyle={styles.gridContent}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.centered}>
                  <StyledText style={{ color: theme.textSecondary, textAlign: "center" }}>
                    {candidates.length === 0
                      ? "Everyone you chat with is already in this group."
                      : "No people found."}
                  </StyledText>
                </View>
              }
            />
          )}

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Button
              title="Add"
              loading={addMembers.isPending}
              disabled={selectedIds.length === 0}
              onPress={handleAdd}
            />
          </View>
        </View>
      </BottomSheetModal>
    );
  },
);

AddMembersSheet.displayName = "AddMembersSheet";

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    title: {
      textAlign: "center",
      marginTop: 4,
      marginBottom: 16,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 48,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      padding: 0,
      fontSize: 16,
      fontFamily: fonts.medium,
      color: theme.textPrimary,
    },
    gridContent: {
      paddingBottom: 16,
    },
    column: {
      marginBottom: 16,
    },
    person: {
      width: `${100 / COLUMNS}%`,
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 2,
    },
    avatarRing: {
      padding: 3,
      borderRadius: 34,
      borderWidth: 2,
      borderColor: "transparent",
    },
    avatarRingSelected: {
      borderColor: theme.buttonPrimary,
    },
    check: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.buttonPrimary,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
    },
    footer: {
      paddingTop: 12,
      backgroundColor: theme.bgNeutral,
    },
  });
