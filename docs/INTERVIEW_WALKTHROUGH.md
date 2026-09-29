# CarMechanicOS interview walkthrough

## 60-second explanation

CarMechanicOS is a browser-first mechanic-empire simulation built with vanilla HTML, CSS, and JavaScript. I kept the simulation state in the client so the game remains usable with localStorage, then added an optional authenticated Supabase adapter for persistent saves. The security work focused on release boundaries: removing a browser-exposed Discord webhook, hardening the local server against path and method abuse, adding browser security headers, and replacing an anonymous Supabase prototype policy with `auth.uid()`-scoped row-level security. The public repository is a sanitized snapshot; private history, runtime state, and credentials are intentionally excluded.

## Three-minute technical walkthrough

1. **Product problem:** combine repair orders, inventory, logistics, businesses, factions, progression, and world-map decisions into one browser simulation.
2. **State model:** `game.js` remains the simulation source of truth. LocalStorage provides the default save path; the optional backend adapter is disabled unless an authenticated configuration is supplied.
3. **Security boundary:** browser code may use only browser-safe configuration. Service-role keys, database passwords, tunnel credentials, local runtime state, and webhook URLs remain outside the frontend and repository.
4. **Server hardening:** the local server restricts file access to the project boundary, limits request methods, rejects malformed paths, and returns security-focused response headers.
5. **Data boundary:** Supabase cloud saves are opt-in and use owner-scoped policies based on `auth.uid()`. The project does not claim that a full account/login product is complete.
6. **Release evidence:** JavaScript syntax checks, current-tree secret/path scans, Supabase policy checks, and GitHub security workflow validation pass for the public snapshot.

## What changed during hardening?

The most important issue was a browser-exposed Discord webhook. A browser cannot keep that credential secret, so the webhook was removed from the public bundle and the historical endpoint was revoked. BugTracker remains disabled until a protected same-origin or HTTPS proxy exists.

## How was it verified?

- `game.js`, `backend.js`, and `serve-local.js` pass syntax checks.
- The public snapshot contains no active webhook URL, private-key marker, or local machine path.
- The Supabase schema uses authenticated owner-scoped row-level security.
- The GitHub security workflow checks JavaScript syntax, high-risk credential markers, local runtime artifacts, machine-specific paths, and the Supabase policy.

## Current limitations

- Browser smoke tests for fresh reset, saved reload, App Store purchases, and daily simulation accounting remain open.
- The game does not yet include a complete account/login flow.
- BugTracker proxy integration is not enabled.
- Third-party asset and code-license review remains open; see [`ASSET_RIGHTS_REVIEW.md`](ASSET_RIGHTS_REVIEW.md).

## Production improvement

I would add a formal account/session boundary, server-side validation for every cloud-save mutation, automated browser tests, dependency pinning, CSP hardening without inline allowances, protected telemetry for BugTracker, and a completed asset/license inventory before broad distribution.
