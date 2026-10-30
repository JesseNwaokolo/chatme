import axios from "axios";
import { apiClient } from "@/src/api/client";
import { UploadError, uploadMedia } from "../mediaApi";

jest.mock("@/src/api/client", () => ({ apiClient: { post: jest.fn() } }));
jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return { ...actual, __esModule: true, default: { ...actual.default, post: jest.fn() }, isAxiosError: actual.isAxiosError };
});
jest.mock("expo-crypto", () => ({ randomUUID: () => "generated-id" }));

const post = apiClient.post as jest.Mock;
const transfer = axios.post as jest.Mock;

const params = { uri: "file:///a.jpg", purpose: "message_attachment" as const, contentType: "image/jpeg", filename: "a.jpg", sizeBytes: 10 };
const media = (overrides = {}) => ({ id: "media-1", completedAt: null, ...overrides });
const target = { url: "https://upload.example/x", method: "POST", expiresAt: "", fields: { signature: "secret" } };

beforeEach(() => {
  post.mockReset();
  transfer.mockReset();
});

describe("uploadMedia", () => {
  it("runs create, transfer and complete, reporting progress after each stage", async () => {
    post.mockResolvedValueOnce({ data: { media: media(), upload: target } });
    transfer.mockResolvedValueOnce({});
    post.mockResolvedValueOnce({ data: media({ completedAt: "now" }) });
    const stages: string[] = [];

    const result = await uploadMedia(params, undefined, (p) => stages.push(p.stage));

    expect(result).toEqual({ id: "media-1" });
    expect(stages).toEqual(["transfer", "complete", "done"]);
  });

  it("names the stage that failed and keeps identifiers for the retry", async () => {
    post.mockResolvedValueOnce({ data: { media: media(), upload: target } });
    transfer.mockRejectedValueOnce(new Error("network down"));
    let last: any;

    await expect(uploadMedia(params, undefined, (p) => (last = p))).rejects.toMatchObject({
      name: "UploadError",
      stage: "transfer",
    });

    expect(last).toEqual({ clientUploadId: "generated-id", stage: "transfer", mediaId: "media-1" });

    // Retry: same clientUploadId goes to the server again, only the remaining stages run.
    post.mockResolvedValueOnce({ data: { media: media(), upload: target } });
    transfer.mockResolvedValueOnce({});
    post.mockResolvedValueOnce({ data: media() });
    await uploadMedia(params, last);
    expect(post.mock.calls[1][1]).toMatchObject({ clientUploadId: "generated-id" });
  });

  it("skips the transfer when the server replays a finished upload (upload: null)", async () => {
    post.mockResolvedValueOnce({ data: { media: media({ completedAt: "then" }), upload: null } });

    const result = await uploadMedia(params);

    expect(result).toEqual({ id: "media-1" });
    expect(transfer).not.toHaveBeenCalled();
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("resumes at complete without creating or transferring again", async () => {
    post.mockResolvedValueOnce({ data: media() });

    await uploadMedia(params, { clientUploadId: "u", stage: "complete", mediaId: "media-7" });

    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toContain("media-7");
    expect(transfer).not.toHaveBeenCalled();
  });

  it("does nothing for an upload that is already done", async () => {
    const result = await uploadMedia(params, { clientUploadId: "u", stage: "done", mediaId: "media-9" });
    expect(result).toEqual({ id: "media-9" });
    expect(post).not.toHaveBeenCalled();
  });

  it("never exposes signed upload fields in the persisted progress", async () => {
    post.mockResolvedValueOnce({ data: { media: media(), upload: target } });
    transfer.mockRejectedValueOnce(new Error("x"));
    const seen: unknown[] = [];
    await uploadMedia(params, undefined, (p) => seen.push(p)).catch(() => {});
    expect(JSON.stringify(seen)).not.toContain("secret");
    expect(JSON.stringify(seen)).not.toContain("upload.example");
  });

  it("reports a create failure as the create stage", async () => {
    post.mockRejectedValueOnce(new Error("boom"));
    await expect(uploadMedia(params)).rejects.toBeInstanceOf(UploadError);
  });
});
