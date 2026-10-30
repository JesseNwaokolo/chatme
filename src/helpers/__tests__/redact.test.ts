import { describeError, redactObject, redactString, redactUrl } from "../redact";

describe("redaction", () => {
  it("strips bearer tokens, JWTs and credential query params from strings", () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc_DEF-123";
    expect(redactString(`Authorization: Bearer ${jwt}`)).not.toContain("eyJ");
    expect(redactString(`raw ${jwt} here`)).toBe("raw [redacted-jwt] here");
    expect(redactString("https://x.test/up?signature=abc123&timestamp=5")).toBe(
      "https://x.test/up?signature=[redacted]&timestamp=5",
    );
  });

  it("drops query strings from URLs", () => {
    expect(redactUrl("https://x.test/upload?signature=s&api_key=k")).toBe("https://x.test/upload");
  });

  it("redacts sensitive keys at any depth", () => {
    expect(
      redactObject({ headers: { Authorization: "Bearer abc" }, body: { refreshToken: "r", name: "n" } }),
    ).toEqual({ headers: { Authorization: "[redacted]" }, body: { refreshToken: "[redacted]", name: "n" } });
  });

  it("describes an axios error without its request config or headers", () => {
    const error = {
      isAxiosError: true,
      message: "Request failed",
      response: { status: 500 },
      config: { method: "post", url: "/media/upload?signature=s", headers: { Authorization: "Bearer secret" } },
    };
    const line = describeError(error);
    expect(line).toBe("POST /media/upload failed (500)");
    expect(line).not.toContain("secret");
  });

  it("falls back safely for unknown values", () => {
    expect(describeError(undefined)).toBe("unknown error");
    expect(describeError(new Error("boom Bearer abc.def"))).toBe("boom Bearer [redacted]");
  });
});
