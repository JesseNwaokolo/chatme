import { getMimeType, resolveContentType } from "@/src/shared/media/mediaApi";
import * as Contacts from "expo-contacts";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { PickedMedia } from "../types";
import { NewAttachment } from "./useMessageDelivery";
import { describeError } from "@/src/helpers/redact";

interface Options {
  send: (payload: { text?: string; attachments?: NewAttachment[] }) => void;
  closeSheet: () => void;
}

// Turns what the user picked (media, document, contact, location) into an outgoing message.
export function useAttachmentHandlers({ send, closeSheet }: Options) {
  const handlePickMedia = (items: PickedMedia[]) => {
    closeSheet();
    if (items.length === 0) return;

    const hasVideo = items.some((item) => item.kind === "video");
    if (hasVideo && items.length > 1) {
      Toast.show({
        type: "info",
        text1: "Send one video at a time",
        text2: "Videos can't be combined with other media.",
      });
      return;
    }

    send({
      attachments: items.map((item) => {
        const contentType =
          item.mimeType ?? (item.kind === "video" ? "video/mp4" : getMimeType(item.uri));
        const extension = contentType.split("/")[1] ?? "jpg";
        return {
          type: item.kind,
          uri: item.uri,
          contentType,
          filename: item.fileName ?? `${item.kind}-${Date.now()}.${extension}`,
          sizeBytes: item.fileSize,
        };
      }),
    });
  };

  const handlePickDocument = async () => {
    let result: DocumentPicker.DocumentPickerResult;
    try {
      result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    } catch (error) {
      closeSheet();
      Toast.show({
        type: "error",
        text1: "Couldn't open documents",
        text2: error instanceof Error ? error.message : undefined,
      });
      return;
    }
    closeSheet();
    if (result.canceled) return;

    const doc = result.assets[0];
    let contentType: string;
    try {
      contentType = resolveContentType(doc.name, doc.mimeType);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Unsupported file",
        text2: error instanceof Error ? error.message : undefined,
      });
      return;
    }
    send({
      attachments: [
        { type: "document", uri: doc.uri, contentType, filename: doc.name, sizeBytes: doc.size },
      ],
    });
  };

  const handlePickContact = async () => {
    let contact: Contacts.ExistingContact | null = null;
    try {
      contact = await Contacts.presentContactPickerAsync();
    } catch (error) {
      console.log("[conversation] contact picker failed:", describeError(error));
      Toast.show({
        type: "error",
        text1: "Couldn't open contacts",
        text2: error instanceof Error ? error.message : undefined,
      });
    }
    closeSheet();
    if (!contact) return;

    const name = contact.name ?? "Contact";
    const numbers = (contact.phoneNumbers ?? []).map((p) => p.number).filter(Boolean);
    send({ text: [`👤 ${name}`, ...numbers].join("\n") });
  };

  const handlePickLocation = async () => {
    closeSheet();

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Location permission needed",
        text2: "Allow location access to share where you are.",
      });
      return;
    }

    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      send({
        text: `📍 My location\nhttps://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
      });
    } catch {
      Toast.show({ type: "error", text1: "Couldn't get your location" });
    }
  };

  return { handlePickMedia, handlePickDocument, handlePickContact, handlePickLocation };
}
