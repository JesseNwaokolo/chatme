import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import axios from "axios";
import * as Crypto from "expo-crypto";

export type MediaPurpose = "profile_avatar" | "group_avatar" | "message_attachment";

export interface Media {
  id: string;
  purpose: MediaPurpose;
  status: string;
  type: string;
  contentType: string;
  sizeBytes: number;
  originalFilename: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  secureUrl: string | null;
  createdAt: string;
  expiresAt: string | null;
  completedAt: string | null;
}

interface CreateUploadResponse {
  media: Media;
  upload: {
    url: string;
    method: string;
    expiresAt: string;
    fields: Record<string, string>;
  };
}

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4a: "audio/mp4",
  pdf: "application/pdf",
};

export const getMimeType = (uri: string) =>
  MIME_TYPES[uri.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

const createUpload = (body: {
  clientUploadId: string;
  purpose: MediaPurpose;
  contentType: string;
  sizeBytes: number;
  originalFilename: string;
}) =>
  apiClient.post<CreateUploadResponse>(endpoints.media.createUpload, body).then((res) => res.data);

const completeUpload = (mediaId: string) =>
  apiClient.post<Media>(endpoints.media.completeUpload(mediaId)).then((res) => res.data);

/**
 * Full signed-upload flow: register the upload with our API, send the file to the
 * returned (Cloudinary) URL with the signed fields, then confirm completion.
 */
export async function uploadMedia(params: {
  uri: string;
  purpose: MediaPurpose;
  contentType?: string;
  filename?: string;
  sizeBytes?: number;
}): Promise<Media> {
  const contentType = params.contentType ?? getMimeType(params.uri);
  const extension = params.uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const originalFilename = params.filename ?? `${params.purpose}-${Date.now()}.${extension}`;

  const sizeBytes = params.sizeBytes ?? (await (await fetch(params.uri)).blob()).size;

  const { media, upload } = await createUpload({
    clientUploadId: Crypto.randomUUID(),
    purpose: params.purpose,
    contentType,
    sizeBytes,
    originalFilename,
  });

  const formData = new FormData();
  Object.entries(upload.fields).forEach(([key, value]) => formData.append(key, value));
  formData.append("file", {
    uri: params.uri,
    type: contentType,
    name: originalFilename,
  } as unknown as Blob);

  try {
    await axios.post(upload.url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message ?? "Couldn't upload file");
    }
    throw error;
  }

  return completeUpload(media.id);
}
