# Security policy

CarMechanicOS is a browser-first prototype. It is safe to run locally, but it is not a substitute for a production authenticated backend.

## Report a vulnerability

Do not publish credentials, webhook URLs, tunnel tokens, database exports, or private player data in a GitHub issue. Contact the repository owner privately with the affected file, reproduction steps, impact, and any relevant logs after redacting secrets.

If a credential has ever appeared in source, a commit, a screenshot, or a browser request, revoke or rotate it at the provider immediately. Removing it from the latest commit does not invalidate the old credential.

## Security boundaries

- `backend-config.js`, `.env*` files, Cloudflare logs/tokens, local databases, keys, and runtime state are local-only and ignored by Git.
- The local Node server binds to `127.0.0.1`, serves only `GET` and `HEAD`, blocks repository/configuration files, and emits baseline browser security headers.
- BugTracker must post to a same-origin or HTTPS server-side proxy. A Discord webhook must never be placed in `game.js`, `index.html`, or `backend-config.js`; the browser cannot keep that credential secret.
- Supabase cloud saves are disabled unless explicitly enabled with a browser-safe key, an authenticated access token, and a player id matching `auth.uid()`. The SQL schema uses authenticated row-level security; never restore an anonymous `using (true)` policy.
- Cloudflare is the HTTPS edge for the public hostname. Keep its tunnel credential outside this repository and outside frontend configuration.

## Public-release gate

This repository was created from a sanitized snapshot and does not inherit the private development repository's Git history. Future public changes must still satisfy [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md) before they are merged.

Credentials that ever existed in private development infrastructure must be revoked or rotated before related integrations are reused. Never copy private history, browser state, tunnel credentials, or local configuration into this repository.

## Local validation

Run these checks before publishing a build:

```powershell
node --check game.js
node --check backend.js
node --check serve-local.js
git diff --check
rg -n "discord.*api/webhooks|service_role|-----BEGIN|cloudflared.*token|Bearer [A-Za-z0-9]" . --glob '!SECURITY.md' --glob '!PUBLIC_RELEASE_CHECKLIST.md' --glob '!.github/workflows/security.yml'
```

The final search should return no committed secret or provider credential. Any historical credential that was previously committed must still be rotated at its provider.

## Known limitations

The current game has no account login flow. Therefore, authenticated Supabase cloud saves and a secure BugTracker proxy require an external integration before they can be enabled. LocalStorage remains the default gameplay path.
