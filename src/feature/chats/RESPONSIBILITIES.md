# Conversation responsibilities

Who owns what in the conversation screen. If you are changing X, touch only the owner.

| Concern | Owner | Notes |
|---|---|---|
| Wiring one conversation together | `screens/ConversationScreen.tsx` | Coordinates hooks and components; holds no send/upload/scroll/draft logic itself. |
| Rendering messages, scroll position, history states | `components/MessageList.tsx` | Loading, empty, failed (retry), refresh-failed banner, loading older / older failed. |
| One message bubble, screen-reader label and actions | `components/MessageBubble.tsx` | Renders every `ChatMessage` state, including `unsupported`. |
| Text input, edit mode, persisted draft | `components/MessageComposer.tsx` | Talks to the screen only through callbacks (`onSubmit`, `onTyping`, ...). |
| Attachment sheet, recent media, permission states | `components/AttachmentPickerSheet.tsx` | Loading / limited / denied (open settings) / error (retry). |
| Sending, retry, upload stages, outbox | `hooks/useMessageDelivery.ts` + `store/useOutboxStore.ts` | Outbox keyed by account + conversation; keeps client id, payload and upload progress until confirmed. |
| Upload stages (create, transfer, complete) | `shared/media/mediaApi.ts` | Persists only `clientUploadId`, `mediaId`, `stage`; never signed targets. |
| What picking media/document/contact/location sends | `hooks/useAttachmentHandlers.ts` | Builds the outgoing payload; knows nothing about delivery. |
| React / edit / delete on confirmed messages | `hooks/useMessageInteractions.ts` | Applies server results to the cache; rollback only undoes the user's own reaction. |
| Typing indicator lifecycle | `hooks/useTypingIndicator.ts` | Stops on pause, blur, background, unmount. |
| Presence and live typing from others | `hooks/useConversationSocket.ts` | |
| Message cache ordering | `utils/messageCache.ts` | Identity + version ordering. |
| Parsing server responses | `api/parsers.ts` (called by `api/messagesApi.ts`) | Malformed items are skipped; unknown kinds become `unsupported`. |
| Message state model | `types.ts` (`ChatMessage` union) | `confirmed` / `sending` / `failed` / `unsupported`. |
| Drafts | `store/useDraftStore.ts` | Keyed by account + conversation; cleared on logout. |
| Mute | server `settings.muted` + `mutedUntil`; `utils/mute.ts`, `api/useMuteToggle.ts` | Optimistic cache update with rollback. |
| Notification taps | `shared/notifications/notificationRouting.ts` + `NotificationRouter.tsx` | Validates, dedupes, waits for readiness, navigates by conversation id only. |

## If the upload API changes
Only `shared/media/mediaApi.ts` (stages and request shapes) and, if the payload shape changes,
`hooks/useMessageDelivery.ts`. `MessageComposer` is untouched because it only emits text via `onSubmit`.
