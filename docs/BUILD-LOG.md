# Build Log

## Phase 1 — OS simulation

The first version established the desktop metaphor: the player opens business tools as if they were operating-system applications. This made complex management systems feel approachable while allowing the game to stay lightweight and browser-friendly.

## Phase 2 — Empire systems

The simulation expanded from individual repairs into a global business layer. Locations carry ownership, rent, stability, heat, part-class access, and faction relationships. The taskbar and news ticker turn those background systems into immediate feedback.

## Phase 3 — Risk and progression

XP, certifications, perks, illegal operations, and FBI heat were added to create meaningful tradeoffs. The player can grow faster by taking risks, but raids and seizures can reset momentum.

## Phase 4 — Map correction

The map asset was reviewed as a square image. The layout previously stretched it to the full rectangular window, which changed the visual proportions of continents. The CSS now keeps the map square and responsive, preserving the relationship between the raster map and its overlay markers.

## Phase 5 — 3D transition

The 3D version should begin with one polished garage scene. That prototype will prove camera movement, interaction, vehicle placement, workstation tasks, and UI integration before the project commits to a complete explorable world.

## Phase 6 — Certified delivery workforce

Certifications.exe now connects player progression to logistics automation. The Logistics License unlocks the first worker, Route Optimization unlocks speed, Fleet Management unlocks shipment capacity and a second worker, and Hazmat Endorsement unlocks reliability improvements for high-risk routes. Worker upgrades are intentionally unavailable until the matching certification is purchased, making the certification tree explain and control the automation economy.

## Phase 7 — Operations Contracts content layer

Added five claimable strategic objectives to Active Repair Orders. Contracts connect repairs, inventory, expansion, certified workers, and protected high-risk operations to cash/XP rewards, completion notifications, AutoWire news updates, and save-file persistence.

## Phase 8 — Leveling and certification progression polish

- Added rank names and visible next-milestone guidance to PlayerProfile.exe.
- Added level-up messaging for certification unlock milestones.
- Hardened XP input handling so invalid or negative awards cannot corrupt progression.
- Documented the connection between XP, skill points, and Certifications.exe licenses.

## Phase 9 — Economy bug resolution and issue queue

- Fixed daily simulation accounting so neutral, unpurchased locations cannot reduce player cash.
- Added a repository-facing Issues and verification queue to README with resolved bugs and next test targets.
- Added an App Store ownership ledger and migration for legacy saves that incorrectly marked paid apps as unlocked.
- Factory Reset now clears local and optional Supabase cloud persistence before starting a new playthrough.
- Added consistent insufficient-funds feedback: CSS screen shake, red desktop outline, red purchase-button outline, vibration where supported, and an explanatory notification.
- Localized App Store insufficient-funds feedback to the App Store window so the whole desktop remains steady.

## Phase 10 — Garage operations content pass

- Added garage reputation and customer satisfaction metrics to Active Repair Orders.
- Added paid Repair Lift, Parts Storage, and Security business upgrades in Empire Portfolio.
- Added worker payroll and morale persistence; morale influences automated dispatch speed.
- Added rotating Supplier Loyalty, Fleet Rush, and Rival Poaching events to the daily simulation.

## Phase 11 — Security hardening

- Removed the hard-coded Discord webhook from the browser bundle. BugTracker now accepts only a configured same-origin or HTTPS server-side proxy, so a provider credential cannot be shipped to every player.
- Changed the optional Supabase adapter to explicit opt-in with an authenticated access token, validated URLs/table names, bounded requests, and timeout handling.
- Replaced the permissive Supabase prototype policy with `auth.uid()`-scoped authenticated row-level security.
- Hardened the local server with path protection, GET/HEAD-only handling, malformed-URL handling, security response headers, and a report-only CSP migration policy.
- Added repository ignore rules and `SECURITY.md` guidance for Cloudflare credentials, local saves, runtime logs, and incident response.

## Suggested 3D scene sequence

```text
Garage → Repair bay → Parts shelf → Customer handoff → Daily results
   │
   └── Strategic OS overlay: money, jobs, inventory, territory, heat
```

The simulation remains the source of truth. The 3D world becomes the way the player experiences and acts on that simulation.
