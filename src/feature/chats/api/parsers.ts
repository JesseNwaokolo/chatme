import { MessageAttachment } from "@/src/shared/types/conversation";
import { MessageListResponse, MessageReaction, MessageResponse } from "./types";

export class MalformedResponseError extends Error {
  constructor(what: string) {
    super(`Unexpected ${what} from server`);
    this.name = "MalformedResponseError";
  }
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const isTimestamp = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));
const optionalString = (value: unknown) => (typeof value === "string" ? value : undefined);
const optionalNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

// Unknown `type` / `kind` values are kept as-is so a newer server can add content types
// without the item being dropped; the UI renders those as an explicit "unsupported" message.
function parseAttachment(raw: unknown): MessageAttachment | null {
  if (!isObject(raw) || !isString(raw.type) || !isString(raw.url)) return null;
  return {
    mediaId: optionalString(raw.mediaId) ?? "",
    type: raw.type as MessageAttachment["type"],
    contentType: optionalString(raw.contentType) ?? "",
    sizeBytes: optionalNumber(raw.sizeBytes) ?? 0,
    url: raw.url,
    width: optionalNumber(raw.width),
    height: optionalNumber(raw.height),
    durationMs: optionalNumber(raw.durationMs),
    filename: optionalString(raw.filename),
  };
}

function parseReaction(raw: unknown): MessageReaction | null {
  return isObject(raw) && isString(raw.userId) && isString(raw.emoji)
    ? { userId: raw.userId, emoji: raw.emoji }
    : null;
}

// Returns null when the item cannot be shown at all (no identity, sender or valid time).
export function parseMessage(raw: unknown): MessageResponse | null {
  if (!isObject(raw)) return null;
  if (
    !isString(raw.id) ||
    !isString(raw.conversationId) ||
    !isString(raw.senderId) ||
    !isString(raw.kind) ||
    !isTimestamp(raw.createdAt)
  ) {
    return null;
  }
  if (raw.text != null && typeof raw.text !== "string") return null;
  if (raw.attachments != null && !Array.isArray(raw.attachments)) return null;

  const attachments = raw.attachments?.map(parseAttachment) as (MessageAttachment | null)[] | undefined;
  // An attachment we cannot read at all makes the whole message unrenderable; dropping only
  // that attachment would silently show a different message than the sender sent.
  if (attachments?.some((a) => a === null)) return null;

  return {
    id: raw.id,
    conversationId: raw.conversationId,
    clientMessageId: optionalString(raw.clientMessageId) ?? "",
    senderId: raw.senderId,
    kind: raw.kind as MessageResponse["kind"],
    text: (raw.text as string | null | undefined) ?? null,
    attachments: attachments as MessageAttachment[] | undefined,
    createdAt: raw.createdAt,
    replyToMessageId: optionalString(raw.replyToMessageId) ?? null,
    editedAt: isTimestamp(raw.editedAt) ? raw.editedAt : null,
    deletedAt: isTimestamp(raw.deletedAt) ? raw.deletedAt : null,
    version: optionalNumber(raw.version),
    reactions: Array.isArray(raw.reactions)
      ? raw.reactions.map(parseReaction).filter((r): r is MessageReaction => r !== null)
      : undefined,
  };
}

export function parseMessageResponse(raw: unknown): MessageResponse {
  const message = parseMessage(raw);
  if (!message) throw new MalformedResponseError("message");
  return message;
}

// A page with a broken envelope is an error (so the query shows its failed state); a page
// with some broken items keeps the good ones and reports how many were skipped.
export function parseMessageList(raw: unknown): MessageListResponse {
  if (!isObject(raw) || !Array.isArray(raw.items) || !isObject(raw.pageInfo)) {
    throw new MalformedResponseError("message list");
  }
  const items = raw.items
    .map(parseMessage)
    .filter((item): item is MessageResponse => item !== null);
  const skipped = raw.items.length - items.length;
  if (skipped > 0) console.warn(`[messages] skipped ${skipped} malformed item(s)`);

  const { nextCursor, hasNextPage } = raw.pageInfo;
  return {
    items,
    pageInfo: {
      nextCursor: typeof nextCursor === "string" ? nextCursor : null,
      hasNextPage: hasNextPage === true && typeof nextCursor === "string",
    },
  };
}
