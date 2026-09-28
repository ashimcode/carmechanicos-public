# Antigravity project history

This document preserves the prior Antigravity development notes imported on September 9, 2026. These are historical decisions and reported milestones for CarMechanicOS; current source code remains the final authority when behavior differs.

## DarkNet.exe and illicit logistics

- The DarkNet market was expanded with ten categorized Class X parts.
- Standard catalog generation was protected from accidentally creating Class X variants.
- DarkNet search filters the Class X parts list in real time.
- The Black Market, Encrypted Transit, and Stash House tabs have distinct active/inactive styling.
- Class X purchases show immediate feedback and move into an encrypted transit flow.
- Drone Drop was intentionally made high-risk at 55% interception risk; Smuggler delivery is slower but lower risk at 5%.
- Intercepted shipments trigger a Federal Interception alert, seize the contraband, and apply a $10,000 fine.
- Smuggler deliveries can trigger a randomized midpoint interception between 20% and 80% of transit time.
- The midpoint event includes a 5x5 memory-grid mini-game with pause and win/loss resolution.

## Heat and FBI lockdown

- Global heat and wanted-level behavior were added to the illicit operations loop.
- At maximum heat, FBI lockdown targets illicit applications rather than the normal Inventory and Logistics surfaces.
- The desktop displays a global investigation banner and illicit apps receive lock styling.
- DarkNet and other illicit applications are blocked during the five-minute investigation window, then restored when the timer expires.
- Offline time and save persistence were considered part of the lockdown experience.

## Desktop and application decisions

- The former Garage & Shop surface was renamed **Inventory**.
- The Operations Center was renamed **Active Repair Orders**, including its desktop icon.
- The Office Computer became **Logistics.exe**, with regional contracts, transit times, and supply-chain tracking.
- Junkyard is treated as a separate location: it visually takes focus while other desktop windows remain open underneath and return when the player leaves.
- A missing closing `</div>` once nested later windows inside Inventory; restoring that boundary fixed broken Office and other app launching.
- Native desktop double-click behavior is preferred over an aggressive touch/double-tap listener so dragging icons does not accidentally open them.

## QA, versioning, and documentation

- BugTracker was connected to Discord webhook reporting with issue type, reporter, description, and diagnostic metadata including heat and inventory.
- Webhook errors use HTTP status checks and visible failure feedback; successful reports reset the form and show a temporary confirmation.
- Build query strings were added to JavaScript and CSS imports to prevent stale browser assets.
- The MechanicOS build version was surfaced in the desktop UI and advanced through the 0.2.x line.
- Antigravity used `walkthrough.md`, `implementation_plan.md`, and `task.md` as working artifacts for feature planning and verification.

## Planned direction carried forward

The Antigravity notes identified Certifications.exe as the next major system: hire workers to automate deliveries, then gate worker skills behind certifications. That direction is now implemented in the current repository with Logistics License, Route Optimization, Fleet Management, and Hazmat Endorsement progression.

