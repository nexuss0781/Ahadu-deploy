import { afterEach, describe, expect, it, vi } from "vitest";
import { exchangeNexussHandoff } from "./_core/nexuss";

describe("Nexuss Auth handoff", () => {
  afterEach(() => vi.restoreAllMocks());

  it("rejects a replayed or expired handoff response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "invalid_handoff" }), { status: 401 }));
    await expect(exchangeNexussHandoff("replayed-handoff-test")).rejects.toThrow("Nexuss handoff exchange failed (401)");
  });

  it("exchanges a one-time handoff on the server and returns an application session", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "nexuss-user-1", name: "A. User", email: "user@example.com", provider: "github" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await exchangeNexussHandoff("one-time-handoff-test");

    expect(result.openId).toBe("nexuss-user-1");
    expect(result.loginMethod).toBe("github");
    expect(result.sessionToken.split(".")).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://nexuss-auth.vercel.app/v1/handoff/exchange",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ projectId: "ahadu-deploy", handoffToken: "one-time-handoff-test" }),
      }),
    );
  });
});
