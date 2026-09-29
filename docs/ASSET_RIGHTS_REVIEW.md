# Asset and license review

**Status:** Review required before granting broad reuse rights.  
**Snapshot date:** 2026-09-28

This public repository is available for portfolio inspection, but it does not currently grant a broad source or asset license. The absence of a `LICENSE` file means GitHub users should not assume permission to reuse or redistribute the code or bundled assets.

## Inventory

| Asset or dependency | Repository use | Current review state | Required follow-up |
|---|---|---|---|
| JavaScript, HTML, CSS, and local server code | Core project implementation | Author ownership is intended, but no broad license has been granted | Choose and add a license only after confirming the intended reuse terms |
| `assets/world-map.png` | In-game map background and README evidence | Source/rights record not yet attached | Confirm authoring source or replace with a documented asset |
| `assets/screenshots/*` | Portfolio screenshots | Appear to be project captures; rights/subject review still belongs to the owner | Confirm no private data and that publication is authorized |
| `assets/Wan2.2_i2v_00001_.mp4` | Project media asset | Origin and redistribution terms are not recorded in this repository | Record generation/source terms or remove before granting broad reuse rights |
| Google Fonts (`Outfit`, `Plus Jakarta Sans`) | UI typography | External dependency; provider terms apply | Keep attribution/terms record or self-host only after reviewing the applicable license |
| Chart.js CDN | Runtime charting dependency | External dependency; version and license record should be pinned | Record the version and license in a dependency note |
| Unsplash image URLs | Optional in-game visual themes | External hosted content; current URLs are not a redistribution grant | Keep as runtime references only or replace with assets with documented rights |

## Decision

Until the open rows are confirmed, describe this repository as a sanitized public portfolio snapshot, not as a freely reusable package. Do not add an open-source license by assumption.

## Review evidence to add later

- source or generation record for each bundled image, video, and map;
- authorization status for screenshots and any visible personal or third-party information;
- dependency versions and license references;
- chosen code license and a clear separation between code rights and asset rights.
