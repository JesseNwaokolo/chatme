import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { DeviceContact } from "../types";

type Status = "loading" | "granted" | "denied";

export function useDeviceContacts() {
  const [status, setStatus] = useState<Status>("loading");
  const [contacts, setContacts] = useState<DeviceContact[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { status: permissionStatus } = await Contacts.requestPermissionsAsync();

      if (permissionStatus !== "granted") {
        if (!cancelled) setStatus("denied");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
      });

      if (cancelled) return;

      const deviceContacts: DeviceContact[] = data
        .filter((contact) => contact.name && contact.phoneNumbers?.length)
        .map((contact) => ({
          id: contact.id ?? contact.name,
          name: contact.name,
          phoneNumbers: (contact.phoneNumbers ?? [])
            .map((phone) => phone.number)
            .filter((number): number is string => !!number),
          imageUri: contact.image?.uri ?? null,
        }));

      setContacts(deviceContacts);
      setStatus("granted");
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, contacts };
}
