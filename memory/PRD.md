# PRD — Enrollment UI Frontend Modernization

## Original problem statement
"check how improve frontend which is in enrolment-ui / new folder"

PRODUCT REQUIREMENTS: Full visual redesign and responsive polish. Better desktop experience; Better mobile experience; Accessibility and readability; Faster, clearer enrolment completion. Preserve the current brand closely but modernize the look.

## Target codebase
- Path: `/app/enrollment-ui/New folder` (Vite + React 19 + TypeScript + Tailwind v4)
- Auth: Keycloak (`@react-keycloak/web`)
- Build: `NODE_OPTIONS=--max-old-space-size=4096 yarn build`

## Architecture
- Frontend only session (backend microservices on 8081-8089 are proxied via Vite dev server, not deployed here).
- Primary redesigned screens live under `src/app/pages/dashboards/providerManagernt/hospitalEmpanelment/`.

## User personas
- Hospital/provider admin completing empanelment registration.
- Internal provider-management staff reviewing applications.

## Core requirements (static)
- Modernized brand-preserving visual direction
- Desktop + mobile responsive polish
- Accessible, readable typography & color contrast
- Clearer, faster enrolment flow

## What's been implemented
### 2026-01-05
- Generated UI/UX design guidelines (`/app/design_guidelines.json`)
- Redesigned Hospital Empanelment Landing page (`src/app/pages/dashboards/providerManagernt/hospitalEmpanelment/landing/index.tsx`)
- Redesigned Hospital Empanelment Registration Form (`src/app/pages/dashboards/providerManagernt/hospitalEmpanelment/registrationForm/index.tsx`)
- Updated global styles (`src/styles/index.css`)
- Fixed `package.json` + `package-lock.json` illegal name (`"MD INDIA"` → `"md-india"`) — unblocks `yarn install` / `yarn build`
- Added placeholder `public/env.js` so Vite can resolve the runtime env script at build time (runtime deployment overrides it)
- Added `allowedHosts: true` to vite dev server config so the Emergent preview URL isn't blocked
- Verified clean production build (`yarn build` passes)

## Prioritized backlog
### P1
- Visually verify redesigned Landing + Registration pages against a live Keycloak + backend stack
- Mobile responsive QA pass on redesigned pages at 390px, 768px, 1024px, 1440px
### P2
- Address large chunk warnings (several bundles > 1 MB) via code-splitting / lazy loading
- Browserslist DB is 12 months old — refresh with `npx update-browserslist-db@latest`
- Redesign remaining provider-management screens (dashboard, provider list, agreement detail) to match the new system

## Test credentials
Stored in `/app/memory/test_credentials.md` (Keycloak: ram.chaugule / Admin@123).
Note: Keycloak IdP is NOT deployed in this preview container, so interactive auth testing requires the full microservice stack.

## Known limitations
- The `/app/enrollment-ui/New folder` path contains spaces — always quote it in shell commands
- A duplicate inactive `New folder (2)` directory exists next to the target folder; do not use it
