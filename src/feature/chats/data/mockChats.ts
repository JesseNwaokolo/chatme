import { Chat, SuggestedContact } from "../types";

const today = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const yesterday = (hours: number, minutes: number) => {
  const date = today(hours, minutes);
  date.setDate(date.getDate() - 1);
  return date;
};

export const mockChats: Chat[] = [
  {
    id: "1",
    name: "Darrell Steward",
    online: true,
    lastMessage: "Hello, Good morning✨",
    timestamp: today(23, 47),
    unreadCount: 4,
  },
  {
    id: "2",
    name: "Jane Cooper",
    online: true,
    lastMessage: "Can you sent the photo?",
    fromMe: true,
    timestamp: today(23, 23),
  },
  {
    id: "3",
    name: "Theresa Webb",
    lastMessage: "Okay, Thank you",
    timestamp: today(23, 17),
    unreadCount: 4,
  },
  {
    id: "4",
    name: "Work Team",
    isGroup: true,
    lastMessage: "Wait, i'am on my way!",
    timestamp: today(20, 26),
  },
  {
    id: "5",
    name: "Annette Black",
    online: true,
    lastMessage: "Okay Rin, sounds good. Let's...",
    fromMe: true,
    timestamp: today(20, 13),
  },
  {
    id: "6",
    name: "Ronald Richards",
    muted: true,
    lastMessage: "Can you sent the photo?",
    fromMe: true,
    timestamp: yesterday(18, 2),
  },
  {
    id: "7",
    name: "Guy Hawkins",
    lastMessage: "See you tomorrow!",
    timestamp: yesterday(15, 40),
  },
];

export const suggestedContacts: SuggestedContact[] = [
  { id: "s1", name: "Mom" },
  { id: "s2", name: "Sir Albert" },
  { id: "s3", name: "Cody Fisher" },
  { id: "s4", name: "Wade Warren" },
];

export const suggestedContactsOverflowCount = 26;
