import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import axios, { isAxiosError } from "axios";
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

interface UploadTarget {
  url: string;
  method: string;
  expiresAt: string;
  fields: Record<string, string>;
}

// `upload` is null when the server recognises the clientUploadId and the file is already
// stored (a replayed create), so there is nothing left to transfer.
interface CreateUploadResponse {
  media: Media;
  upload: UploadTarget | null;
}

// Which step runs next. `clientUploadId` and `mediaId` are the identifiers that must stay the
// same across retries so the server can recognise the upload instead of creating a second one.
// Signed upload targets are deliberately not part of this record: they are credentials, so
// they are never persisted and a retry asks the server for a fresh one.
export type UploadStage = "create" | "transfer" | "complete" | "done";

export interface UploadProgress {
  clientUploadId: string;
  stage: UploadStage;
  mediaId?: string;
}

export const newUploadProgress = (): UploadProgress => ({
  clientUploadId: Crypto.randomUUID(),
  stage: "create",
});

export class UploadError extends Error {
  constructor(
    readonly stage: Exclude<UploadStage, "done">,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "UploadError";
  }
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

export interface UploadParams {
  uri: string;
  purpose: MediaPurpose;
  contentType?: string;
  filename?: string;
  sizeBytes?: number;
}

const transferMessage = (error: unknown) =>
  isAxiosError(error)
    ? (error.response?.data?.error?.message ?? "Couldn't upload file")
    : error instanceof Error
      ? error.message
      : "Couldn't upload file";

async function transferFile(target: UploadTarget, file: { uri: string; type: string; name: string }) {
  const formData = new FormData();
  Object.entries(target.fields).forEach(([key, value]) => formData.append(key, value));
  formData.append("file", file as unknown as Blob);
  await axios.post(target.url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// Runs the create, transfer and complete stages, resuming from `progress`. `onProgress` is
// called after each stage so the caller can persist it; a failure is thrown as an
// UploadError naming the stage that failed, and the last reported progress is what to retry with.
export async function uploadMedia(
  params: UploadParams,
  progress: UploadProgress = newUploadProgress(),
  onProgress: (progress: UploadProgress) => void = () => {},
): Promise<{ id: string }> {
  const contentType = resolveContentType(params.filename ?? params.uri, params.contentType);
  const extension = params.uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const originalFilename = params.filename ?? `${params.purpose}-${Date.now()}.${extension}`;

  let current = progress;
  const advance = (next: Partial<UploadProgress>) => {
    current = { ...current, ...next };
    onProgress(current);
  };

  if (current.stage === "create" || current.stage === "transfer") {
    // A retry of the transfer stage repeats create: the same clientUploadId yields the same
    // media with a fresh target (or `upload: null` if the file already arrived).
    let created: CreateUploadResponse;
    try {
      const sizeBytes = params.sizeBytes ?? (await (await fetch(params.uri)).blob()).size;
      created = await createUpload({
        clientUploadId: current.clientUploadId,
        purpose: params.purpose,
        contentType,
        sizeBytes,
        originalFilename,
      });
    } catch (error) {
      throw new UploadError("create", transferMessage(error), error);
    }
    advance({ mediaId: created.media.id, stage: "transfer" });

    if (created.upload) {
      try {
        await transferFile(created.upload, { uri: params.uri, type: contentType, name: originalFilename });
      } catch (error) {
        throw new UploadError("transfer", transferMessage(error), error);
      }
    }
    advance({ stage: created.media.completedAt ? "done" : "complete" });
  }

  if (current.stage === "complete") {
    if (!current.mediaId) throw new UploadError("complete", "Upload is missing its media id");
    try {
      await completeUpload(current.mediaId);
    } catch (error) {
      throw new UploadError("complete", transferMessage(error), error);
    }
    advance({ stage: "done" });
  }

  if (!current.mediaId) throw new UploadError("complete", "Upload is missing its media id");
  return { id: current.mediaId };
}
