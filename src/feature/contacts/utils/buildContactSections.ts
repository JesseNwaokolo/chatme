import { ContactMatch } from "../api/types";
import { ContactRow, ContactSection, DeviceContact, MatchedUser } from "../types";
import { normalizePhoneNumber } from "./normalizePhoneNumber";

interface BuildResult {
  sections: ContactSection[];
  matchesByUserId: Map<string, MatchedUser>;
}

export function buildContactSections(deviceContacts: DeviceContact[], matches: ContactMatch[]): BuildResult {
  const matchByNumber = new Map<string, MatchedUser>();
  const matchesByUserId = new Map<string, MatchedUser>();

  for (const match of matches) {
    const matchedUser: MatchedUser = {
      id: match.user.id,
      displayName: match.user.displayName,
      avatarUrl: match.user.avatarUrl,
      phoneNumber: match.matchedPhoneNumber,
    };
    matchByNumber.set(match.matchedPhoneNumber, matchedUser);
    matchesByUserId.set(match.user.id, matchedUser);
  }

  const onChatMe: ContactRow[] = [];
  const rest: ContactRow[] = [];

  for (const contact of deviceContacts) {
    const matchedUser = contact.phoneNumbers
      .map((number) => matchByNumber.get(normalizePhoneNumber(number)))
      .find((candidate): candidate is MatchedUser => !!candidate);

    const row: ContactRow = {
      id: contact.id,
      name: contact.name,
      phoneNumber: matchedUser?.phoneNumber ?? contact.phoneNumbers[0],
      imageUri: contact.imageUri,
      matchedUser,
    };

    (matchedUser ? onChatMe : rest).push(row);
  }

  onChatMe.sort((a, b) => a.name.localeCompare(b.name));
  rest.sort((a, b) => a.name.localeCompare(b.name));

  const sections: ContactSection[] = [];
  if (onChatMe.length > 0) {
    sections.push({ title: "On ChatMe", data: onChatMe });
  }

  const byLetter = new Map<string, ContactRow[]>();
  for (const row of rest) {
    const letter = row.name.trim().charAt(0).toUpperCase() || "#";
    const bucket = byLetter.get(letter) ?? [];
    bucket.push(row);
    byLetter.set(letter, bucket);
  }

  for (const letter of [...byLetter.keys()].sort()) {
    sections.push({ title: letter, data: byLetter.get(letter) ?? [] });
  }

  return { sections, matchesByUserId };
}
