# CarMechanicOS public-release checklist

This checklist is the release gate for maintaining the public CarMechanicOS portfolio. The repository was created from a sanitized snapshot rather than copied with private development history.

## Current release record

The initial public snapshot was rechecked on 2026-09-28. One historical Discord webhook found in the private development history was revoked at the provider (HTTP 204). The public tree contains no webhook URL, private-key marker, or machine-specific `[local Windows path]` path. License and third-party asset-rights review remain open before implying broad reuse rights.

## Required actions for future public changes

1. Re-run a history-wide secret scan and a current-tree scan. Check Discord webhooks, Supabase service-role keys, Cloudflare tunnel tokens, bearer tokens, private keys, database dumps, browser state, local paths, and personal data.
2. Confirm `backend-config.js`, `.env*`, tunnel logs, local databases, keys, and runtime state remain untracked. Only a browser-safe Supabase publishable/anon key may appear in a client build, and only with strict authenticated Row Level Security.
3. Remove or separately license every third-party binary, font, image, screenshot, map, and audio/video asset. Keep evidence that the repository has redistribution rights.
4. Choose and add an explicit repository license. Until then, do not imply that the source or assets are freely reusable.
5. Test a fresh local checkout with no ignored configuration: localStorage gameplay, factory reset, save/reload, and the local server should work without cloud credentials.
6. Run the repository checks:

   ```powershell
   node --check game.js
   node --check backend.js
   node --check serve-local.js
   git diff --check
   rg -n "discord.*api/webhooks|service_role|-----BEGIN|cloudflared.*token|Bearer [A-Za-z0-9]" .
   ```

7. Review the final public landing page for personal names, local usernames, private hostnames, support diagnostics, screenshots containing account data, and claims that are not demonstrated by the current build.
8. Publish future changes through a reviewed pull request and keep the public profile links aligned with the actual release state.

## Release principle

Public promotion should follow:

`Audit → Revoke/rotate → Purge history → Verify clean checkout → Review assets/license → Publish`
