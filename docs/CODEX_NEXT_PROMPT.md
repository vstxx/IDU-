# Prompt do Codexa — IDU+ next pass

You are working inside the `IDU+` Chrome/Opera WebExtension project for `https://s19.idu.edu.pl/*`.

Goal: make IDU+ actually production-usable as a local browser extension. Do not rewrite the entire project. Preserve the existing Manifest V3 structure and keep the extension local, private, and safe.

Current project structure:

- `manifest.json` — MV3 extension config.
- `content/idu-modern.css` — main visual redesign.
- `content/idu-modern.js` — DOM tagging, dashboard/profile/login detection, subject-card transformation, mobile improvements.
- `popup/*` — IDU+ popup settings.
- `docs/*` — usage and prompt docs.

Important constraints:

1. Do not request or store passwords, cookies, session tokens, or private credentials.
2. Do not add broad host permissions. Keep the extension scoped to `https://s19.idu.edu.pl/*`.
3. Do not use a framework. This should stay a small native WebExtension: CSS + vanilla JS.
4. Keep the visual identity as `IDU+`.
5. Default theme: light, clean, compact, modern, with Inter-first font stack.
6. Preserve IDU functionality. Do not remove links, forms, collapse toggles, or server-rendered content.
7. Avoid brittle selectors when possible, but target known legacy IDU selectors when needed.

Known issues from live screenshots:

- Dashboard is improved but still has uneven vertical rhythm.
- Spacing should be more compact: smaller gaps between top header, semester selector, breadcrumbs, modules, document pill, and dashboard columns.
- Profile page was previously broken because profile subcolumns became too narrow and text wrapped vertically. Audit all profile selectors and make profile data readable in cards or a stable grid.
- Login page needs a polished clean card layout.
- Some foldable modules still have old inner grey containers.
- Some links/buttons are styled inconsistently.
- Mobile needs special care: old tables should scroll horizontally or convert into cards where safe.

Tasks:

1. Run a source audit of `content/idu-modern.css` and `content/idu-modern.js`.
2. Identify over-broad selectors that can break profile layout.
3. Refactor profile CSS so `#student-card`, `#student-data`, contact/address groups, photo, and edit link are stable on desktop and mobile.
4. Tighten compact spacing globally, but keep readability.
5. Improve login page selectors for `/users/sign_in`.
6. Add comments around risky IDU-specific selectors.
7. Keep extension toggle, density toggle, and mobile cards toggle working.
8. Update `CHANGELOG.md` and version in `manifest.json` after changes.
9. Do not introduce dependencies unless absolutely necessary.
10. Make sure `npm run check` passes.

Acceptance criteria:

- Chrome can load the folder with `Load unpacked` without manifest errors.
- Dashboard remains centered and compact.
- Profile page no longer has vertical single-character text columns.
- Header/semester/search/modules have smaller, consistent gaps.
- Login page is visually modern.
- Popup still controls enable/density/mobile-cards.
- No credentials or private data are added to the repo.
