// TEMP: dev-only verification screen for the Socket.IO integration
import {
  startTyping,
  stopTyping,
  subscribePresence,
  unsubscribePresence,
} from "@/src/api/socket/commands";
import { getSocket } from "@/src/api/socket/socketClient";
import { ScreenHeader } from "@/src/shared/components/ScreenHeader";
import { StyledText } from "@/src/shared/components/StyledText";
import useSocketStore from "@/src/store/useSocketStore";
import useUserStore from "@/src/store/useUserStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";

const SOCKET_EVENTS = [
  "message.created",
  "receipt.delivered",
  "receipt.read",
  "presence.changed",
  "typing.started",
  "typing.stopped",
] as const;

const SocketDebugRoute = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const isConnected = useSocketStore((s) => s.isConnected);
  const lastError = useSocketStore((s) => s.lastError);
  const user = useUserStore((s) => s.user);

  const [conversationId, setConversationId] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const appendLog = (line: string) =>
    setLog((prev) =>
      [`${new Date().toLocaleTimeString()}  ${line}`, ...prev].slice(0, 100),
    );

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlers = SOCKET_EVENTS.map((event) => {
      const handler = (payload: unknown) =>
        appendLog(`${event}  ${JSON.stringify(payload)}`);
      socket.on(event, handler as never);
      return { event, handler };
    });

    return () => {
      handlers.forEach(({ event, handler }) => socket.off(event, handler as never));
    };
  }, [isConnected]);

  const formatError = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null) return JSON.stringify(err);
    return String(err);
  };

  const runCommand = (label: string, fn: () => Promise<unknown>) => {
    if (!conversationId) {
      appendLog("enter a conversationId first");
      return;
    }
    fn()
      .then((data) => appendLog(`${label} ok  ${JSON.stringify(data)}`))
      .catch((err) => appendLog(`${label} error  ${formatError(err)}`));
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Socket Debug" />

      <View style={styles.content}>
        <StyledText
          weight="bold"
          style={{ color: isConnected ? theme.buttonPrimary : theme.textTertiary }}
        >
          {isConnected ? "● connected" : "○ disconnected"}
        </StyledText>

        {lastError && (
          <StyledText size={12} style={{ color: "#D14343" }}>
            last error: {lastError}
          </StyledText>
        )}

        <StyledText size={12} selectable style={{ color: theme.textSecondary }}>
          your userId: {user?.id ?? "(not loaded)"}
        </StyledText>

        <TextInput
          placeholder="conversationId"
          placeholderTextColor={theme.textTertiary}
          value={conversationId}
          onChangeText={setConversationId}
          autoCapitalize="none"
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.textTertiary }]}
        />

        <View style={styles.row}>
          <Pressable
            style={styles.button}
            onPress={() => runCommand("subscribe", () => subscribePresence(conversationId))}
          >
            <StyledText style={{ color: theme.buttonPrimaryText }}>Subscribe</StyledText>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => runCommand("unsubscribe", () => unsubscribePresence(conversationId))}
          >
            <StyledText style={{ color: theme.buttonPrimaryText }}>Unsubscribe</StyledText>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable
            style={styles.button}
            onPress={() => runCommand("typing.start", () => startTyping(conversationId))}
          >
            <StyledText style={{ color: theme.buttonPrimaryText }}>Start typing</StyledText>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => runCommand("typing.stop", () => stopTyping(conversationId))}
          >
            <StyledText style={{ color: theme.buttonPrimaryText }}>Stop typing</StyledText>
          </Pressable>
        </View>

        <FlatList
          data={log}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => (
            <StyledText size={12} style={{ color: theme.textSecondary }}>
              {item}
            </StyledText>
          )}
          style={styles.log}
        />
      </View>
    </View>
  );
};

export default SocketDebugRoute;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bgNeutral },
    content: { flex: 1, padding: 16, gap: 12 },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    row: { flexDirection: "row", gap: 8 },
    button: {
      flex: 1,
      backgroundColor: theme.buttonPrimary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: "center",
    },
    log: { flex: 1, marginTop: 8 },
  });
