# Nexuss Auth replacement

- [x] Install the Nexuss CLI without exposing credentials.
- [x] Authenticate the CLI using the secure `NEXUSS_AUTH_TOKEN` environment variable.
- [x] Verify account scope and inspect the available Nexuss projects.
- [x] Use the current Manus deployment and authentication as the temporary fallback.
- [x] Create and configure an Ahadu Deploy Nexuss project with temporary Manus URLs.
- [x] Replace or layer Nexuss Auth into Ahadu Deploy without breaking the fallback.
- [x] Audit sign-in, session recovery, logout, callback handling, project configuration, and secret boundaries.
- [x] Save a checkpoint and report the audited result.

## Audit gaps

- [x] Verify Nexuss GitHub start navigation uses the configured project and callback.
- [ ] Verify a successful `/auth/callback` handoff creates an authenticated application session.
- [ ] Verify authenticated session retrieval, logout, signed-out startup, and handoff replay rejection.
- [x] Add and execute focused tests for Nexuss session and replay boundaries.
- [ ] Save a new audited checkpoint and report verified versus unverified results.

## GitHub repository sync

- [ ] Verify the public `Ahadu-deploy` repository and configured remote.
- [ ] Commit and push the current Ahadu Deploy project, including Nexuss Auth and Manus fallback changes.
- [ ] Confirm the remote branch and report the repository URL.
