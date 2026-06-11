# Changelog

## 0.4.0 - Live UI audit polish

- Removed remote Inter stylesheet imports from content and popup CSS. IDU+ now uses the local/system Inter-first font stack only.
- Tightened header, account bar, semester selector, breadcrumbs, module headers, and dashboard card spacing.
- Capped long dashboard feed modules such as Aktualnosci, Oceny, and Obecnosci with internal scrolling so one feed no longer makes the dashboard tens of thousands of pixels tall.
- Hardened the Moj profil layout with explicit profile/photo/detail-card classes and safer profile-only page detection.
- Added safe wrappers for legacy data tables so documents, attendance, forum, messages, grades, and similar table-heavy pages can scroll horizontally on small screens.
- Improved the login page card layout, IDU+ branding, full-width form controls, remember-me row, and recovery links.
- Improved mobile header/account/semester behavior and made subject action pills wrap more compactly.
- Expanded `npm run check` to validate manifest semver, content-script file paths, and block remote stylesheet imports.

## 0.3.1 — Codex workspace build

- Added `package.json` with `npm run check` and `npm run pack`.
- Added `docs/OPEN_IN_CODEX.md`.
- Added `docs/CODEX_NEXT_PROMPT.md` with a ready-to-use next-pass Codex prompt.
- Added `fixtures/README.md` for safe local HTML snapshots.
- Kept source as a direct loadable Chrome/Opera extension folder.

## 0.3.0 — Compact polish pass

- More compact spacing.
- Profile page fixes.
- Login page styling.
- Inter-first font stack.
- Better page tagging in content script.

## 0.2.0 — Dashboard layout pass

- Better dashboard centering.
- Grid layout improvements.
- Subject links converted into cleaner cards.
- IDU+ branding.

## 0.1.1 — Chrome import fix

- Manifest placed at extension root.
- Renamed project to IDU+.
