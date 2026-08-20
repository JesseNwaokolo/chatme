const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function formatChatTime(date: Date): { label: string; isToday: boolean } {
  const now = new Date();

  if (isSameDay(date, now)) {
    return {
      label: date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
      isToday: true,
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return { label: "Yesterday", isToday: false };
  }

  return {
    label: date.toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    }),
    isToday: false,
  };
}
