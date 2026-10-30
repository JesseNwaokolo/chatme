import { ApiError } from "@/src/api/errors";
import { UploadError, UploadProgress, newUploadProgress, uploadMedia } from "@/src/shared/media/mediaApi";
import useOutboxStore, { OutboxEntry, outboxScope } from "@/src/store/useOutboxStore";
import useUserStore from "@/src/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useCallback, useMemo, useRef } from "react";
import Toast from "react-native-toast-message";
import { getConversation } from "../api/chatsApi";
import { sendMessage } from "../api/messagesApi";
import { chatKeys } from "../api/queryKeys";
import { MessageResponse } from "../api/types";
import { LocalAttachment } from "../types";
import { upsertMessageInCache } from "../utils/messageCache";
import { describeError } from "@/src/helpers/redact";

const NO_ENTRIES: OutboxEntry[] = [];

export type NewAttachment = Omit<LocalAttachment, "upload">;

interface UseMessageDeliveryOptions {
  conversationId: string;
  onConversationGone: () => void;
}

const failureText = (error: unknown) =>
  error instanceof UploadError
    ? `Upload failed while ${{ create: "preparing", transfer: "uploading", complete: "finishing" }[error.stage]} the file. ${error.message}`
    : error instanceof Error
      ? error.message
      : "Please try again.";

// Owns sending: the outbox (persisted per account and conversation), uploads, and retry.
// Every message in the outbox keeps its client id, payload and upload progress until the
// server confirms it, so a retry resends the same message instead of a new one.
export function useMessageDelivery({ conversationId, onConversationGone }: UseMessageDeliveryOptions) {
  const queryClient = useQueryClient();
  const accountId = useUserStore((s) => s.user?.id);
  const scope = accountId ? outboxScope(accountId, conversationId) : null;
  const entries = useOutboxStore((s) => (scope ? s.entries[scope] : undefined)) ?? NO_ENTRIES;
  const inFlight = useRef(new Set<string>());

  const deliver = useCallback(
    async (clientMessageId: string) => {
      if (!scope || !accountId) return;
      const store = useOutboxStore.getState();
      const find = () => useOutboxStore.getState().entries[scope]?.find((e) => e.clientMessageId === clientMessageId);
      const entry = find();
      if (!entry || inFlight.current.has(clientMessageId)) return;

      inFlight.current.add(clientMessageId);
      store.update(scope, clientMessageId, { state: "sending", error: undefined });
      const sameAccount = () => useUserStore.getState().user?.id === accountId;

      try {
        // Each attachment uploads independently so one failure doesn't discard the others;
        // progress (including finished media ids) is saved as each stage completes.
        const results = await Promise.allSettled(
          entry.attachments.map((attachment, index) =>
            uploadMedia(
              {
                uri: attachment.uri,
                purpose: "message_attachment",
                contentType: attachment.contentType,
                filename: attachment.filename,
                sizeBytes: attachment.sizeBytes,
              },
              attachment.upload,
              (upload: UploadProgress) =>
                useOutboxStore.getState().updateAttachment(scope, clientMessageId, index, { upload }),
            ),
          ),
        );
        const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
        if (failed) throw failed.reason;
        const mediaIds = results.map((r) => (r as PromiseFulfilledResult<{ id: string }>).value.id);

        const data = await sendMessage(conversationId, {
          clientMessageId,
          text: entry.text || undefined,
          attachmentMediaIds: mediaIds.length ? mediaIds : undefined,
        });
        useOutboxStore.getState().remove(scope, clientMessageId);
        if (!sameAccount()) return;
        upsertMessageInCache(queryClient, data);
        queryClient.invalidateQueries({ queryKey: chatKeys.list() });
      } catch (error) {
        if (!sameAccount()) return;

        if (error instanceof ApiError && error.status === 404) {
          const stillExists = await getConversation(conversationId).then(
            () => true,
            (err) => !(err instanceof ApiError && err.status === 404),
          );
          if (!stillExists) {
            useOutboxStore.getState().remove(scope, clientMessageId);
            onConversationGone();
            return;
          }
          useOutboxStore.getState().update(scope, clientMessageId, {
            state: "failed",
            error: "One of you may have blocked the other.",
          });
          Toast.show({
            type: "error",
            text1: "Can't message this contact",
            text2: "One of you may have blocked the other.",
          });
          return;
        }

        console.log("[conversation] send failed:", error instanceof UploadError ? `upload ${error.stage}` : describeError(error));
        useOutboxStore
          .getState()
          .update(scope, clientMessageId, { state: "failed", error: failureText(error) });
        Toast.show({ type: "error", text1: "Couldn't send message", text2: failureText(error) });
      } finally {
        inFlight.current.delete(clientMessageId);
      }
    },
    [scope, accountId, conversationId, queryClient, onConversationGone],
  );

  const send = useCallback(
    (payload: { text?: string; attachments?: NewAttachment[] }) => {
      if (!scope) return;
      const clientMessageId = Crypto.randomUUID();
      useOutboxStore.getState().enqueue(scope, {
        clientMessageId,
        text: payload.text,
        attachments: (payload.attachments ?? []).map((a) => ({ ...a, upload: newUploadProgress() })),
        state: "sending",
        createdAt: Date.now(),
      });
      deliver(clientMessageId);
    },
    [scope, deliver],
  );

  const discard = useCallback(
    (clientMessageId: string) => {
      if (scope) useOutboxStore.getState().remove(scope, clientMessageId);
    },
    [scope],
  );

  // Drop outbox entries the server already has (e.g. the app died after the server accepted
  // the send but before the response was handled).
  const reconcile = useCallback(
    (history: MessageResponse[]) => {
      if (!scope) return;
      const confirmed = new Set(history.map((m) => m.clientMessageId).filter(Boolean));
      useOutboxStore
        .getState()
        .entries[scope]?.filter((e) => e.state === "failed" && confirmed.has(e.clientMessageId))
        .forEach((e) => useOutboxStore.getState().remove(scope, e.clientMessageId));
    },
    [scope],
  );

  return useMemo(
    () => ({ entries, send, retry: deliver, discard, reconcile }),
    [entries, send, deliver, discard, reconcile],
  );
}
