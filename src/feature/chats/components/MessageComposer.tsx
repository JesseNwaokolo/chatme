import { StyledText } from "@/src/shared/components/StyledText";
import { PaperclipIcon, SendIcon } from "@/src/shared/icons";
import useDraftStore from "@/src/store/useDraftStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, TextInput, View } from "react-native";

const DRAFT_SAVE_DELAY_MS = 300;

interface MessageComposerProps {
  // Identifies where the draft is stored (account + conversation). Changing it swaps drafts.
  draftScope: string | null;
  bottomInset: number;
  // When set, the composer edits this text instead of the draft; the draft is kept aside.
  editing: { text: string } | null;
  onSubmit: (text: string) => void;
  onCancelEdit: () => void;
  onTyping: () => void;
  onToggleAttachments: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}

export const MessageComposer = ({
  draftScope,
  bottomInset,
  editing,
  onSubmit,
  onCancelEdit,
  onTyping,
  onToggleAttachments,
  onLayout,
}: MessageComposerProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [text, setText] = useState(() =>
    draftScope ? (useDraftStore.getState().drafts[draftScope] ?? "") : "",
  );
  const stashedDraft = useRef("");
  const wasEditing = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ draftScope, text, editing: !!editing });
  latest.current = { draftScope, text, editing: !!editing };

  // Load the stored draft whenever the account/conversation changes.
  useEffect(() => {
    setText(draftScope ? (useDraftStore.getState().drafts[draftScope] ?? "") : "");
  }, [draftScope]);

  useEffect(() => {
    if (editing && !wasEditing.current) {
      stashedDraft.current = latest.current.text;
      setText(editing.text);
    } else if (!editing && wasEditing.current) {
      setText(stashedDraft.current);
    }
    wasEditing.current = !!editing;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.text, !!editing]);

  // Persist the draft shortly after typing stops, and flush when leaving.
  useEffect(() => {
    if (!draftScope || editing) return;
    saveTimer.current = setTimeout(
      () => useDraftStore.getState().setDraft(draftScope, text),
      DRAFT_SAVE_DELAY_MS,
    );
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [text, draftScope, editing]);

  useEffect(
    () => () => {
      const { draftScope: scope, text: current, editing: isEditing } = latest.current;
      if (scope && !isEditing) useDraftStore.getState().setDraft(scope, current);
    },
    [],
  );

  const handleChange = (value: string) => {
    setText(value);
    onTyping();
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!editing) {
      setText("");
      if (draftScope) useDraftStore.getState().setDraft(draftScope, "");
    }
    onSubmit(trimmed);
  };

  return (
    <>
      {editing && (
        <View style={styles.editBanner}>
          <StyledText size={13} weight="medium" style={{ color: theme.textSecondary, flex: 1 }}>
            Editing message
          </StyledText>
          <Pressable
            hitSlop={8}
            onPress={onCancelEdit}
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
          >
            <StyledText size={13} weight="bold" style={{ color: theme.buttonPrimary }}>
              Cancel
            </StyledText>
          </Pressable>
        </View>
      )}
      <View style={[styles.composer, { paddingBottom: bottomInset + 12 }]} onLayout={onLayout}>
        <Pressable
          hitSlop={8}
          onPress={onToggleAttachments}
          accessibilityRole="button"
          accessibilityLabel="Attach"
          accessibilityHint="Opens photos, documents, location and contacts"
        >
          <PaperclipIcon size={22} color={theme.textSecondary} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={handleChange}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary }]}
          accessibilityLabel="Message"
          multiline
        />
        <Pressable
          style={[styles.sendButton, { backgroundColor: theme.buttonPrimary }]}
          onPress={handleSubmit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={editing ? "Save edit" : "Send message"}
          accessibilityState={{ disabled: !text.trim() }}
        >
          <SendIcon size={18} color={theme.buttonPrimaryText} />
        </Pressable>
      </View>
    </>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    editBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.bgNeutral,
    },
    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: theme.bgNeutral,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    input: {
      flex: 1,
      fontSize: 16,
      maxHeight: 120,
      paddingVertical: 8,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
