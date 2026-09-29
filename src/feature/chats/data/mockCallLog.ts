export type CallType = "incoming" | "outgoing" | "missed";

export interface CallLogEntry {
  id: string;
  name: string;
  avatarUrl: string;
  type: CallType;
  timestamp: Date;
}

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

export const mockCallLog: CallLogEntry[] = [
  {
    id: "c1",
    name: "Annie Miles",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    type: "incoming",
    timestamp: today(22, 30),
  },
  {
    id: "c2",
    name: "Wade Warren",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
    type: "outgoing",
    timestamp: today(22, 0),
  },
  {
    id: "c3",
    name: "Guy Hawkins",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    type: "missed",
    timestamp: today(20, 32),
  },
  {
    id: "c4",
    name: "Robert Fox",
    avatarUrl: "https://i.pravatar.cc/150?img=53",
    type: "outgoing",
    timestamp: yesterday(23, 11),
  },
  {
    id: "c5",
    name: "Savannah Nguyen",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    type: "incoming",
    timestamp: yesterday(22, 22),
  },
  {
    id: "c6",
    name: "Albet Flores",
    avatarUrl: "https://i.pravatar.cc/150?img=52",
    type: "outgoing",
    timestamp: yesterday(22, 10),
  },
  {
    id: "c7",
    name: "Annette Black",
    avatarUrl: "https://i.pravatar.cc/150?img=30",
    type: "incoming",
    timestamp: yesterday(21, 31),
  },
  {
    id: "c8",
    name: "Floyd Miles",
    avatarUrl: "https://i.pravatar.cc/150?img=48",
    type: "outgoing",
    timestamp: yesterday(21, 0),
  },
  {
    id: "c9",
    name: "Kathryn Murphy",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
    type: "incoming",
    timestamp: yesterday(20, 21),
  },
];
