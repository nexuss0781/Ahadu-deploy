import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Existing Manus OAuth fallback. */
export const startLogin = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  window.location.href = url.toString();
};

/** Nexuss Auth GitHub sign-in. The browser only receives public routing values. */
export const startNexussGithubLogin = () => {
  const authUrl = import.meta.env.VITE_NEXUSS_AUTH_URL;
  const projectId = import.meta.env.VITE_NEXUSS_AUTH_PROJECT_ID;
  const redirectUri = import.meta.env.VITE_NEXUSS_AUTH_REDIRECT_URI || `${window.location.origin}/auth/callback`;
  const url = new URL(`${authUrl}/oauth/start/github`);
  url.searchParams.set("project_id", projectId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("handoff", "1");
  window.location.assign(url.toString());
};
