export interface BlockedContact {
  id: string;
  name: string;
  phoneNumber: string;
  avatarUrl: string;
}

export const mockBlockedContacts: BlockedContact[] = [
  {
    id: "b1",
    name: "Annette Black",
    phoneNumber: "+61-827-680-673",
    avatarUrl: "https://i.pravatar.cc/150?img=31",
  },
  {
    id: "b2",
    name: "Arlene McCoy",
    phoneNumber: "+61-827-680-673",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: "b3",
    name: "Annie Miles",
    phoneNumber: "+61-827-680-673",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "b4",
    name: "Kathryn Murphy",
    phoneNumber: "+61-827-680-673",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
  },
];
