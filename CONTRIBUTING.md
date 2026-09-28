# Contributing to CarMechanicOS

CarMechanicOS is a browser-first prototype. Contributions should preserve save compatibility, keep the simulation source of truth in `game.js`, and leave the local/cloud boundary explicit.

## Development workflow

1. Create a focused feature or fix branch from `main`.
2. Test from a fresh factory reset and, when state changes, test save/reload as well.
3. Run the local server and check the browser console and visible notifications.
4. Run the syntax, diff, and repository-hygiene checks documented in `SECURITY.md`.
5. Capture only sanitized screenshots or diagnostics; never include browser state, credentials, personal data, or private infrastructure details.
6. Review the staged file list and diff for scope, secrets, generated files, and unsupported claims.
7. Use a Conventional Commit message and open a pull request before merging to `main`.

## Commit format

Use a concise type and imperative subject, for example:

```text
feat(game): add salvage timing loop
fix(save): preserve certification state during reload
security(repo): block local runtime artifacts
docs(release): update public readiness checklist
```

## Public-release boundary

Cloudflare credentials, Supabase service-role keys, authenticated access tokens, local backend configuration, browser profiles, database files, tunnel logs, and unredacted diagnostics are local-only. A browser-safe Supabase publishable/anon key is not a substitute for authentication or Row Level Security.

Before changing repository visibility, complete [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md), including credential rotation and history cleanup.
