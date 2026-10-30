// Turns a tapped push notification into a safe navigation intent.
//
// A notification is untrusted input: it only ever names a conversation, never a route or
// display data. The intent waits until the app can act on it (signed in, navigation ready),
// is dropped if the account changed in the meantime, and is checked against the server
// before navigating so a missing or inaccessible conversation gets a safe fallback.

const CONVERSATION_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const INTENT_TTL_MS = 2 * 60 * 1000;
const MAX_REMEMBERED_NOTIFICATIONS = 200;

export interface NotificationIntent {
  conversationId: string;
  recipientUserId?: string;
}

export function parseNotificationIntent(data: unknown): NotificationIntent | null {
  if (typeof data !== "object" || data === null) return null;
  const { conversationId, recipientUserId } = data as Record<string, unknown>;
  if (typeof conversationId !== "string" || !CONVERSATION_ID_RE.test(conversationId)) return null;
  return {
    conversationId,
    recipientUserId: typeof recipientUserId === "string" ? recipientUserId : undefined,
  };
}

export type ConversationCheck = "ok" | "unavailable" | "unknown";

export interface RoutingState {
  // Signed in with a completed profile and the navigator able to accept a push.
  ready: boolean;
  userId: string | null;
}

export interface RoutingDeps {
  getState: () => RoutingState;
  // "unavailable" = the server says it is missing/forbidden; "unknown" = couldn't tell (offline).
  checkConversation: (conversationId: string) => Promise<ConversationCheck>;
  openConversation: (conversationId: string) => void;
  showUnavailable: () => void;
  now?: () => number;
}

interface PendingIntent extends NotificationIntent {
  // Account that was signed in when the notification was tapped; null if signed out.
  userId: string | null;
  receivedAt: number;
}

export function createNotificationCoordinator(deps: RoutingDeps) {
  const now = deps.now ?? Date.now;
  const seen = new Set<string>();
  let pending: PendingIntent | null = null;
  // Bumped on every new notification so an in-flight check can tell it has been superseded.
  let generation = 0;

  const remember = (identifier: string) => {
    seen.add(identifier);
    if (seen.size > MAX_REMEMBERED_NOTIFICATIONS) seen.delete(seen.values().next().value as string);
  };

  async function process() {
    const intent = pending;
    if (!intent) return;

    const { ready, userId } = deps.getState();
    if (!ready || !userId) return;

    pending = null;
    const claimedGeneration = generation;
    if (now() - intent.receivedAt > INTENT_TTL_MS) return;
    // Tapped under a different account than the one now signed in: not for this user.
    if (intent.userId && intent.userId !== userId) return;
    if (intent.recipientUserId && intent.recipientUserId !== userId) return;

    const check = await deps.checkConversation(intent.conversationId);

    // The account changed, or a newer notification arrived, while we were checking.
    if (claimedGeneration !== generation || deps.getState().userId !== userId) return;

    if (check === "unavailable") deps.showUnavailable();
    else deps.openConversation(intent.conversationId);
  }

  return {
    // `identifier` is the notification's unique id; the same notification can be delivered
    // both by the live listener and as the "last response" on launch.
    receive(identifier: string, data: unknown) {
      if (seen.has(identifier)) return;
      remember(identifier);

      const intent = parseNotificationIntent(data);
      if (!intent) return;

      generation += 1;
      pending = { ...intent, userId: deps.getState().userId, receivedAt: now() };
      void process();
    },
    // Call whenever readiness or the signed-in account may have changed.
    process,
    hasPending: () => pending !== null,
  };
}
