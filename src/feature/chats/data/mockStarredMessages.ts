export interface StarredMessage {
  id: string;
  chatId: string;
  senderName: string;
  avatarUrl: string | null;
  isGroup?: boolean;
  text: string;
  time: string;
  date: string;
}

export const mockStarredMessages: StarredMessage[] = [
  {
    id: "sm1",
    chatId: "1",
    senderName: "Bianne Russell",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    text: "Orci maecenas hendrerit mattis consectetur. Mauris.",
    time: "15:46",
    date: "21/07/2021",
  },
  {
    id: "sm2",
    chatId: "2",
    senderName: "Annie Miles",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    text: "Orci maecenas hendrerit mattis consectetur. Mauris.",
    time: "19:40",
    date: "22/07/2021",
  },
  {
    id: "sm3",
    chatId: "3",
    senderName: "Bessie Cooper",
    avatarUrl: "https://i.pravatar.cc/150?img=44",
    text: "Egestas interdum orci commodo faucibus pretium, neque etiam",
    time: "18:23",
    date: "21/07/2021",
  },
  {
    id: "sm4",
    chatId: "2",
    senderName: "Annie Miles",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    text: "Orci maecenas hendrerit mattis consectetur. Mauris.",
    time: "19:40",
    date: "22/07/2021",
  },
  {
    id: "sm5",
    chatId: "4",
    senderName: "Darrell Steward",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    text: "Habitant elit pellentesque curabitur morbi sit fusce elit.",
    time: "09:12",
    date: "20/07/2021",
  },
  {
    id: "sm6",
    chatId: "5",
    senderName: "Theresa Webb",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    text: "Gravida lectus semper orci, sed fusce.",
    time: "21:05",
    date: "19/07/2021",
  },
];
