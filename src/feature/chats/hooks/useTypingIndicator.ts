import { startTyping, stopTyping } from "@/src/api/socket/commands";
import { useCallback, useEffect, useRef } from "react";

const TYPING_PAUSE_MS = 3000;

// Announces typing while the user is composing and stops on pause, blur, background or unmount.
export function useTypingIndicator(conversationId: string, isViewing: boolean) {
  const isTypingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      stopTyping(conversationId).catch(() => {});
    }
  }, [conversationId]);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (!isViewing) stop();
  }, [isViewing, stop]);

  const notifyTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(conversationId).catch(() => {});
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(stop, TYPING_PAUSE_MS);
  }, [conversationId, stop]);

  return { notifyTyping, stopTyping: stop };
}
