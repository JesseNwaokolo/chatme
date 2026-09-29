import { SettingsRow } from "@/src/feature/settings/components/SettingsRow";
import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import {
  BellIcon,
  BlockIcon,
  CameraIcon,
  ChatIcon,
  ChevronLeftIcon,
  GalleryIcon,
  LinkIcon,
  QrCodeIcon,
  SearchIcon,
  StarIcon,
} from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { AddMembersSheet, AddMembersSheetRef } from "../components/AddMembersSheet";
import { useBlockUser } from "@/src/feature/blocks/api/useBlocks";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import PhotoPickerSheet from "@/src/feature/auth/components/PhotoPickerSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConversation } from "../api/useConversation";
import { useUpdateGroupAvatar } from "../api/useUpdateGroupAvatar";
import {
  useClearConversation,
  useDeleteDirectChat,
  useDeleteGroup,
  useFavoriteConversation,
  useLeaveGroup,
  useRemoveGroupAvatar,
  useRemoveGroupMember,
  useRenameGroup,
  useTransferGroupOwnership,
  useUpdateGroupMemberRole,
} from "../api/useConversationActions";
import { useMuteToggle } from "../api/useMuteToggle";
import { GroupConversationResponse, GroupParticipant } from "@/src/shared/types/conversation";
import useUserStore from "@/src/store/useUserStore";

const HERO_HEIGHT = 420;
const FAB_SIZE = 56;

const MOCK_LAST_SEEN = "Last seen 24 minutes ago";
const MOCK_PHONE_NUMBER = "+1 234 567 8900";
const MOCK_DESCRIPTION = "Available";
const MOCK_PHOTO_COUNT = 24;
const MOCK_STAR_COUNT = 6;
const MOCK_SHARED_LINKS_COUNT = 3;
const MOCK_PHOTO_PLACEHOLDERS = [1, 2, 3, 4, 5];

const ChatProfileScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = useConversation(id);
  const isGroup = data?.type === "group";
  const [pickerVisible, setPickerVisible] = useState(false);
  const updateGroupAvatar = useUpdateGroupAvatar(id);

  const handlePhotoSelected = (uri: string) => {
    updateGroupAvatar.mutate(uri, {
      onError: (error) =>
        Toast.show({
          type: "error",
          text1: "Couldn't update group photo",
          text2: error instanceof Error ? error.message : undefined,
        }),
    });
  };
  const { isMuted, setMuted } = useMuteToggle(id, data?.settings?.muted);
  const myUserId = useUserStore((s) => s.user?.id);
  const favorite = useFavoriteConversation(id);
  const clearChat = useClearConversation(id);
  const deleteDirect = useDeleteDirectChat(id);
  const blockUser = useBlockUser();
  const leaveGroup = useLeaveGroup(id);
  const deleteGroup = useDeleteGroup(id);
  const renameGroup = useRenameGroup(id);
  const removeMember = useRemoveGroupMember(id);
  const updateRole = useUpdateGroupMemberRole(id);
  const transferOwnership = useTransferGroupOwnership(id);
  const removeGroupAvatar = useRemoveGroupAvatar(id);
  const addMembersRef = useRef<AddMembersSheetRef>(null);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const groupData =
    data && data.type === "group" ? (data as GroupConversationResponse) : undefined;
  const myRole = groupData?.role ?? groupData?.participants.find((p) => p.id === myUserId)?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  const fail = (title: string) => (error: unknown) =>
    Toast.show({
      type: "error",
      text1: title,
      text2: error instanceof Error ? error.message : undefined,
    });

  const goToChats = () => router.replace("/(app)/(tabs)/chats");

  const confirm = (title: string, message: string, actionLabel: string, action: () => void) =>
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: actionLabel, style: "destructive", onPress: action },
    ]);

  const handleBlock = () => {
    if (data?.type !== "direct") return;
    confirm("Block contact", `Block ${name}? They won't be able to message you.`, "Block", () =>
      blockUser.mutate(data.otherParticipant.id, {
        onSuccess: goToChats,
        onError: fail("Couldn't block contact"),
      }),
    );
  };

  const handleClear = () =>
    confirm("Clear chat", "Remove all messages from your view?", "Clear", () =>
      clearChat.mutate(undefined, {
        onSuccess: () => Toast.show({ type: "success", text1: "Chat cleared" }),
        onError: fail("Couldn't clear chat"),
      }),
    );

  const handleDeleteDirect = () =>
    confirm("Delete chat", "This deletes the chat for you only.", "Delete", () =>
      deleteDirect.mutate(undefined, { onSuccess: goToChats, onError: fail("Couldn't delete chat") }),
    );

  const handleLeave = () =>
    confirm("Leave group", "You will no longer receive messages from this group.", "Leave", () =>
      leaveGroup.mutate(undefined, {
        onSuccess: goToChats,
        onError: (error) =>
          Toast.show({
            type: "error",
            text1: "Couldn't leave group",
            text2:
              myRole === "owner"
                ? "Transfer ownership before leaving, or delete the group."
                : error instanceof Error
                  ? error.message
                  : undefined,
          }),
      }),
    );

  const handleDeleteGroup = () =>
    confirm("Delete group", "This permanently deletes the group for everyone.", "Delete", () =>
      deleteGroup.mutate(undefined, { onSuccess: goToChats, onError: fail("Couldn't delete group") }),
    );

  const handleRename = () => {
    const nextName = renameValue.trim();
    if (!nextName) return;
    renameGroup.mutate(nextName, {
      onSuccess: () => setRenameVisible(false),
      onError: fail("Couldn't rename group"),
    });
  };

  const handleMemberPress = (member: GroupParticipant) => {
    if (member.id === myUserId || !canManage || member.role === "owner") return;
    const memberName = member.displayName ?? "this member";
    const buttons: { text: string; style?: "cancel" | "destructive"; onPress?: () => void }[] = [];

    if (myRole === "owner") {
      buttons.push({
        text: member.role === "admin" ? "Remove as admin" : "Make admin",
        onPress: () =>
          updateRole.mutate(
            { memberId: member.id, role: member.role === "admin" ? "member" : "admin" },
            { onError: fail("Couldn't update role") },
          ),
      });
      buttons.push({
        text: "Transfer ownership",
        onPress: () =>
          confirm("Transfer ownership", `Make ${memberName} the group owner?`, "Transfer", () =>
            transferOwnership.mutate(member.id, { onError: fail("Couldn't transfer ownership") }),
          ),
      });
    }
    if (myRole === "owner" || member.role === "member") {
      buttons.push({
        text: "Remove from group",
        style: "destructive",
        onPress: () =>
          removeMember.mutate(member.id, { onError: fail("Couldn't remove member") }),
      });
    }
    if (buttons.length === 0) return;
    Alert.alert(memberName, undefined, [...buttons, { text: "Cancel", style: "cancel" }]);
  };

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );

  const name = data
    ? data.type === "group"
      ? data.name
      : (data.otherParticipant.displayName ?? "Unknown")
    : "Unknown";
  const avatarUrl = data ? (data.type === "group" ? data.avatarUrl : data.otherParticipant.avatarUrl) : undefined;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.hero}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <Avatar name={name} size={160} />
          </View>
        )}
        <View style={[styles.heroTopRow, { paddingTop: insets.top + 12 }]}>
          <Pressable style={styles.heroButton} onPress={() => router.back()} hitSlop={12}>
            <ChevronLeftIcon size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.heroTopRowRight}>
            <Pressable
              style={styles.heroButton}
              hitSlop={12}
              onPress={() => router.push({ pathname: "/chat-search/[id]", params: { id } })}
            >
              <SearchIcon size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.heroButton} hitSlop={12}>
              <QrCodeIcon size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroBottom}>
          <StyledText weight="bold" size={26} style={{ color: "#FFFFFF" }} numberOfLines={1}>
            {name}
          </StyledText>
          <StyledText size={14} style={{ color: "rgba(255,255,255,0.8)" }}>
            {MOCK_LAST_SEEN}
          </StyledText>
        </View>

        <Pressable
          style={[styles.fab, { backgroundColor: theme.buttonPrimary }]}
          disabled={updateGroupAvatar.isPending}
          onPress={() => {
            if (!isGroup) {
              router.back();
              return;
            }
            if (!avatarUrl) {
              setPickerVisible(true);
              return;
            }
            Alert.alert("Group photo", undefined, [
              { text: "Change photo", onPress: () => setPickerVisible(true) },
              {
                text: "Remove photo",
                style: "destructive",
                onPress: () =>
                  removeGroupAvatar.mutate(undefined, { onError: fail("Couldn't remove photo") }),
              },
              { text: "Cancel", style: "cancel" },
            ]);
          }}
        >
          {updateGroupAvatar.isPending ? (
            <ActivityIndicator color={theme.buttonPrimaryText} />
          ) : isGroup ? (
            <CameraIcon size={24} color={theme.buttonPrimaryText} />
          ) : (
            <ChatIcon size={24} color={theme.buttonPrimaryText} />
          )}
        </Pressable>
      </View>

      <Modal
        visible={renameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setRenameVisible(false)}>
          <Pressable style={styles.modalCard}>
            <StyledText weight="bold" size={18}>
              Rename group
            </StyledText>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              maxLength={100}
              autoFocus
              style={styles.modalInput}
              placeholder="Group name"
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setRenameVisible(false)} hitSlop={8}>
                <StyledText weight="bold" style={{ color: theme.textSecondary }}>
                  Cancel
                </StyledText>
              </Pressable>
              <Pressable onPress={handleRename} hitSlop={8} disabled={renameGroup.isPending}>
                <StyledText weight="bold" style={{ color: theme.buttonPrimary }}>
                  {renameGroup.isPending ? "Saving..." : "Save"}
                </StyledText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {groupData && (
        <AddMembersSheet
          ref={addMembersRef}
          conversationId={id}
          existingMemberIds={groupData.participants.map((p) => p.id)}
        />
      )}

      <PhotoPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handlePhotoSelected}
      />

      <View style={styles.content}>
        <View style={styles.field}>
          <StyledText weight="bold" size={20}>
            {MOCK_PHONE_NUMBER}
          </StyledText>
          <StyledText size={13} style={{ color: theme.textSecondary }}>
            Phone number
          </StyledText>
        </View>

        <View style={styles.field}>
          <StyledText weight="bold" size={20}>
            {MOCK_DESCRIPTION}
          </StyledText>
          <StyledText size={13} style={{ color: theme.textSecondary }}>
            Description
          </StyledText>
        </View>

        <View style={styles.divider} />

        <StyledText weight="bold" size={18} style={styles.sectionTitle}>
          About
        </StyledText>

        <SettingsRow
          icon={<GalleryIcon color={theme.buttonPrimary} />}
          label={`${MOCK_PHOTO_COUNT} photos`}
          type="nav"
          onPress={() => {}}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoStrip}
          contentContainerStyle={styles.photoStripContent}
        >
          {MOCK_PHOTO_PLACEHOLDERS.map((key) => (
            <View key={key} style={styles.photoPlaceholder} />
          ))}
        </ScrollView>

        <SettingsRow
          icon={<StarIcon color={theme.buttonPrimary} />}
          label={`${MOCK_STAR_COUNT} star message`}
          type="nav"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<LinkIcon color={theme.buttonPrimary} />}
          label={`${MOCK_SHARED_LINKS_COUNT} shared links`}
          type="nav"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<BellIcon color={theme.buttonPrimary} />}
          label="Notifications"
          type="toggle"
          value={!isMuted}
          onToggle={(enabled) => {
            if (!id) return;
            setMuted(!enabled);
          }}
        />
        <SettingsRow
          icon={<StarIcon color={theme.buttonPrimary} filled />}
          label="Favorite chat"
          type="toggle"
          value={!!data?.settings?.favorited}
          onToggle={(enabled) =>
            favorite.mutate(enabled, { onError: fail("Couldn't update favorite") })
          }
        />

        {groupData && (
          <>
            <View style={styles.divider} />
            <View style={styles.sectionHeaderRow}>
              <StyledText weight="bold" size={18}>
                {`Participants (${groupData.participants.length})`}
              </StyledText>
              {canManage && (
                <View style={styles.sectionActions}>
                  <Pressable hitSlop={8} onPress={() => addMembersRef.current?.present()}>
                    <StyledText weight="bold" size={14} style={{ color: theme.buttonPrimary }}>
                      Add
                    </StyledText>
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    onPress={() => {
                      setRenameValue(groupData.name);
                      setRenameVisible(true);
                    }}
                  >
                    <StyledText weight="bold" size={14} style={{ color: theme.buttonPrimary }}>
                      Rename
                    </StyledText>
                  </Pressable>
                </View>
              )}
            </View>
            {groupData.participants.map((member) => (
              <Pressable
                key={member.id}
                style={styles.memberRow}
                onPress={() => handleMemberPress(member)}
              >
                <Avatar name={member.displayName ?? "?"} imageUrl={member.avatarUrl} size={40} />
                <StyledText weight="medium" style={{ flex: 1 }} numberOfLines={1}>
                  {member.id === myUserId ? "You" : (member.displayName ?? "Unknown")}
                </StyledText>
                {member.role !== "member" && (
                  <StyledText size={12} weight="bold" style={{ color: theme.buttonPrimary }}>
                    {member.role === "owner" ? "Owner" : "Admin"}
                  </StyledText>
                )}
              </Pressable>
            ))}
          </>
        )}

        <View style={styles.divider} />

        <Pressable style={styles.blockRow} onPress={handleClear}>
          <StyledText weight="medium" size={16} style={{ color: theme.danger }}>
            Clear chat
          </StyledText>
        </Pressable>

        {groupData ? (
          <>
            <Pressable style={styles.blockRow} onPress={handleLeave}>
              <StyledText weight="medium" size={16} style={{ color: theme.danger }}>
                Leave group
              </StyledText>
            </Pressable>
            {myRole === "owner" && (
              <Pressable style={styles.blockRow} onPress={handleDeleteGroup}>
                <StyledText weight="medium" size={16} style={{ color: theme.danger }}>
                  Delete group
                </StyledText>
              </Pressable>
            )}
          </>
        ) : (
          <>
            <Pressable style={styles.blockRow} onPress={handleDeleteDirect}>
              <StyledText weight="medium" size={16} style={{ color: theme.danger }}>
                Delete chat
              </StyledText>
            </Pressable>
            <Pressable style={styles.blockRow} onPress={handleBlock}>
              <BlockIcon size={20} color={theme.danger} />
              <StyledText weight="medium" size={16} style={{ color: theme.danger }}>
                Block contact
              </StyledText>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ChatProfileScreen;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    hero: {
      height: HERO_HEIGHT,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroFallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.bgPrimaryLight,
    },
    heroTopRow: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    heroTopRowRight: {
      flexDirection: "row",
      gap: 12,
    },
    heroButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(8, 28, 44, 0.5)",
    },
    heroBottom: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 2,
    },
    fab: {
      position: "absolute",
      right: 24,
      bottom: -FAB_SIZE / 2,
      width: FAB_SIZE,
      height: FAB_SIZE,
      borderRadius: FAB_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingTop: FAB_SIZE / 2 + 16,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    field: {
      gap: 4,
      marginBottom: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    sectionTitle: {
      marginBottom: 8,
    },
    photoStrip: {
      marginBottom: 8,
    },
    photoStripContent: {
      gap: 8,
      paddingVertical: 4,
    },
    photoPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: theme.bgPrimaryLighter,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    sectionActions: {
      flexDirection: "row",
      gap: 20,
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
    modalBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(8, 28, 44, 0.5)",
      padding: 24,
    },
    modalCard: {
      width: "100%",
      gap: 16,
      padding: 20,
      borderRadius: 16,
      backgroundColor: theme.bgNeutral,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.textPrimary,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 24,
    },
    blockRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
  });
