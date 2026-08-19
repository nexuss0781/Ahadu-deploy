import { describe, expect, it } from "vitest";

describe("Nexuss Auth configuration", () => {
  it("reaches the configured health endpoint and exposes the expected project settings", async () => {
    const authUrl = process.env.VITE_NEXUSS_AUTH_URL ?? "https://nexuss-auth.vercel.app";
    const projectId = process.env.VITE_NEXUSS_AUTH_PROJECT_ID ?? "ahadu-deploy";
    const redirectUri = process.env.VITE_NEXUSS_AUTH_REDIRECT_URI ?? "";
    const response = await fetch(`${authUrl.replace(/\/$/, "")}/health`);

    expect(response.ok).toBe(true);
    expect(projectId).toBe("ahadu-deploy");
    expect(redirectUri).toContain("/auth/callback");
  }, 20_000);
});
