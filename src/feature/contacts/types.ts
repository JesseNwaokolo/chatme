export interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  imageUri?: string | null;
}

export interface MatchedUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  phoneNumber: string;
}

export interface ContactRow {
  id: string;
  name: string;
  phoneNumber?: string;
  imageUri?: string | null;
  matchedUser?: MatchedUser;
}

export interface ContactSection {
  title: string;
  data: ContactRow[];
}

export interface SearchResultRow {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  phoneNumber?: string;
  inContacts: boolean;
}
