export interface StorageContact {
  id: string;
  name: string;
  phoneNumber: string;
  avatarUrl: string;
  sizeInMB: number;
}

export const mockStorageContacts: StorageContact[] = [
  {
    id: "s1",
    name: "Esther Howard",
    phoneNumber: "+61-827-680-673",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    sizeInMB: 120.3,
  },
  {
    id: "s2",
    name: "Guy Hawkins",
    phoneNumber: "+61-664-234-133",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
    sizeInMB: 431.6,
  },
  {
    id: "s3",
    name: "Robert Fox",
    phoneNumber: "+61-324-773-113",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    sizeInMB: 183.11,
  },
  {
    id: "s4",
    name: "Jacob Jones",
    phoneNumber: "+61-664-121-997",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    sizeInMB: 623.3,
  },
  {
    id: "s5",
    name: "Floyd Miles",
    phoneNumber: "+61-333-444-211",
    avatarUrl: "https://i.pravatar.cc/150?img=17",
    sizeInMB: 325.67,
  },
  {
    id: "s6",
    name: "Dianne Russell",
    phoneNumber: "+61-531-996-421",
    avatarUrl: "https://i.pravatar.cc/150?img=48",
    sizeInMB: 123.3,
  },
];
