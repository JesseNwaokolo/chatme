import { useEffect, useState } from "react";
import { AppState } from "react-native";

// Screen focus and app foreground are different conditions: a focused screen in a
// backgrounded app is not being looked at.
export function useAppActive() {
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => setActive(state === "active"));
    return () => sub.remove();
  }, []);

  return active;
}
