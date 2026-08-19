// Ahadu Deploy / Nexuss Auth: server-only cross-site handoff exchange. Handoff tokens never enter browser code, logs, or application responses.
import { ENV } from "./env";
import { sdk } from "./sdk";

export type NexussUser = {
  id?: string;
  openId?: string;
  sub?: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  provider?: string | null;
};

export async function exchangeNexussHandoff(handoffToken: string) {
  if (!handoffToken) throw new Error("Missing Nexuss handoff token");
  if (!ENV.nexussAuthUrl || !ENV.nexussAuthProjectId) {
    throw new Error("Nexuss Auth is not configured");
  }

  const response = await fetch(`${ENV.nexussAuthUrl.replace(/\/$/, "")}/v1/handoff/exchange`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ projectId: ENV.nexussAuthProjectId, handoffToken }),
  });

  if (!response.ok) throw new Error(`Nexuss handoff exchange failed (${response.status})`);
  const payload = (await response.json()) as { user?: NexussUser };
  const user = payload.user;
  const openId = user?.openId ?? user?.id ?? user?.sub;
  if (!openId) throw new Error("Nexuss user identity missing");

  return {
    openId,
    name: user?.name ?? "",
    email: user?.email ?? null,
    loginMethod: user?.loginMethod ?? user?.provider ?? "github",
    sessionToken: await sdk.signSession(
      { openId, appId: ENV.nexussAuthProjectId, name: user?.name ?? "" },
      { expiresInMs: 1000 * 60 * 60 * 24 * 30 },
    ),
  };
}
