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
  txt: "text/plain",
  webm: "video/webm",
  mp3: "audio/mpeg",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/aac",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const getMimeType = (uriOrName: string) =>
  MIME_TYPES[uriOrName.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

export function resolveContentType(uriOrName: string, reported?: string | null) {
  const candidates = [reported === "image/jpg" ? "image/jpeg" : reported, getMimeType(uriOrName)];
  const match = candidates.find((type): type is string => !!type && ALLOWED_CONTENT_TYPES.has(type));
  if (match) return match;

  const extension = uriOrName.split(".").pop()?.toLowerCase();
  throw new Error(
    `${extension ? `.${extension} files` : "This file type"} can't be sent. Supported: photos, videos, audio, PDF, TXT, DOCX, XLSX, PPTX.`,
  );
}

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

export async function uploadMedia(params: {
  uri: string;
  purpose: MediaPurpose;
  contentType?: string;
  filename?: string;
  sizeBytes?: number;
}): Promise<Media> {
  const contentType = resolveContentType(params.filename ?? params.uri, params.contentType);
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
