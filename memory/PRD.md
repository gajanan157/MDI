# PRD — MD India Operations Workspace

## Original problem statement
"check how improve frontend which is in enrolment-ui / new folder"

Full visual redesign and responsive polish: improve desktop/mobile usability, accessibility, readability and enrolment completion while retaining MD India identity.

Latest request: **"redesign all pages module and i want unique consistant ui application"**.

## Approved user choices
- Design-system approach: rebuild shared shell, header, grouped collapsible sidebar, page headers, cards, tables, forms, inputs, buttons, tabs, modals, badges and states; hand-polish main module screens.
- **"this is b2b application so make it accordingly no long pages with scroll"**.
- Module priority: Enrolment System; Provider Management; Insurer / TPA / Master Management; User Management, Admin dashboard, Settings.
- User rejected previous indigo/slate/Plus Jakarta Sans visual direction: **"I want a different direction"**.
- **"Collapsible left sidebar with module groups"**.
- **"Yes, show realistic sample data"**.
- User confirmed implementation with "yes". English only.

## Personas and requirements
- Enrolment operators processing corporate/retail batches and quality checks.
- Provider administrators managing empanelment, agreements and provider networks.
- Insurer/TPA/master-data staff maintaining organisation records.
- Operations administrators reviewing workload and maintaining user directories.
- Consistent compact B2B visual hierarchy, short workspaces, internally scrollable tables, accessible controls and responsive layouts.

## Architecture / run instructions
- Active frontend: `/app/enrollment-ui/New folder` — React 19, TypeScript, Vite 7, Tailwind 4, Redux, React Router 7.
- Inactive duplicate `New folder (2)` must not be used.
- `/app/frontend/package.json` is the supervisor launcher: `yarn build:dev` then Vite **preview** on platform port 3000.
- **Never run Vite dev for preview**: thousands of module requests previously caused Cloudflare 429 responses.
- Rebuild after source edits: `cd '/app/enrollment-ui/New folder' && NODE_OPTIONS=--max-old-space-size=4096 yarn build:dev`.
- The preview server serves updated `dist` without restart. Regular code edits do NOT automatically rebuild dist.
- Use current preview URL from `/app/frontend/.env` `REACT_APP_BACKEND_URL`, not a prior fork URL.
- Backend microservices and Keycloak are not deployed here. Auth is already MOCKED via `VITE_USE_MOCK=true`, `VITE_ENABLE_KEYCLOAK=false`; automatic admin session, no login needed. Do not un-mock without a new user request.
- Existing mock service data in `src/services/mockDataService.ts`, `mockEnrollmentData.ts`, `mockProviderData.ts` remains in place.

## Current visual system
- `/app/design_guidelines.json` updated by design agent for Precision Teal enterprise direction.
- Charcoal/green-grey sidebar, light neutral surfaces, steel-teal actions; restrained amber/blue/green status accents.
- Cabinet Grotesk headings; IBM Plex Sans interface typography.
- Bordered compact controls, 4–8px radii, accessible focus rings, reduced-motion compatibility.
- Existing MD India logo retained; no marketing landing page.

## Implemented
### Earlier sessions
- Hospital empanelment landing/registration refinements, global typography and styles.
- Fixed illegal package name and added runtime env placeholder.
- Added `/app/frontend` supervisor launcher; resolved missing preview.
- Enabled mock automatic sign-in without a backend.
- Switched from Vite dev to bundled preview to resolve HTTP 429 issues.

### 2026-10-05 — shared redesign and preview workspaces
- Replaced `DynamicLayout` with shared `WorkspaceLayout` for all protected routes: collapsible grouped navigation, mobile drawer, breadcrumbs, module search, notification/help drawers, account shortcut and explicit demo environment status.
- Shared global theme is applied to existing advanced/detail pages without removing their original components or API logic.
- **Polished core views are selected only in MOCK mode** by `router/routeHelpers.ts`; when mock mode is disabled the original API-backed page components are used. This is a preview redesign, not a completed live-data integration for the new views.
- Redesigned enrolment, provider and admin dashboards, including derived record counts, filter shortcuts, sample activity charts, workload summaries and recent records.
- Desktop dashboards fit the workspace height, with record scrolling contained inside the table.
- Redesigned 14 directories: corporate enrolment, retail, policy search, members, providers, insurers, insurer offices, TPA branches, products, corporates, corporate groups, brokers, agents and user directory.
- Shared directory features: search, status/type filters, filter reset, sorting, pagination/page size, row selection and filtered/selected CSV download with spreadsheet formula escaping.
- Record drawers: identity, overview/activity, edit and demo status progression. Seed records may link to the retained full workflow route.
- Three-step local demo create/edit form: basic details, additional details, review; required/email/nonnegative-integer validation and back/cancel controls.
- Record changes persist in browser localStorage only (`mdi-workspace-v1-*`), with same-window change events updating dashboard summaries.
- User-directory entries are NOT authentication accounts; no credentials or real permissions are created or modified.
- New compact hospital empanelment overview; existing registration form retained.
- New settings routes `/settings/general` and `/settings/appearance`: comfortable/compact table density, default rows per page, save/reset, account display and disconnected notification status. Settings stored locally.
- Fixed theme-effect render loop, agent mock-field mapping (`legalName`, `irdaAgentCode`), and low-contrast small labels found during QA.

## Main files
All new components are in `src/app/workspace/`:
- `WorkspaceLayout.tsx`, `navigation.ts`, `workspace.css`: shell, navigation, shared theme and responsive layouts.
- `DashboardPage.tsx`: enrolment/provider/admin dashboards.
- `DirectoryPage.tsx`, `RecordForm.tsx`, `RecordDrawer.tsx`: shared directory and local CRUD views.
- `data.ts`: adapters from existing realistic mock datasets to directory records; config and route mapping.
- `useRecords.ts`: browser-only persistence and cross-view updates.
- `SettingsPage.tsx`, `EmpanelmentPage.tsx`, `PreviewIndex.tsx`.
- `components.tsx`: buttons, badges, page headers, accessible Headless UI overlays, links.
- `exportCsv.ts`: browser CSV export helper.

Routing/style changes:
- `src/app/layouts/DynamicLayout.tsx`
- `src/app/router/routeHelpers.ts`, `protected.tsx`
- `src/styles/index.css`

## Testing status
- Vite bundled build (`yarn build:dev`): PASS.
- ESLint on `src/app/workspace`: PASS.
- Comprehensive frontend testing report: `/app/test_reports/iteration_2.json`.
- Initial test pass found one agent directory crash and small-label contrast issue; both corrected.
- Verified core routes, desktop sidebar persistence, grouped navigation/search, drawer Escape/focus behavior, filters, sorting, pagination, selections, real CSV downloads, create/edit/status progression, reload persistence and settings persistence.
- Existing full provider detail/registration and representative legacy TPA, E-card, provider masters and benefit master routes smoke-tested successfully.
- Targeted post-fix verification: all five master directories populated; correct agent details; inline required/email errors; footer contrast **5.04:1**; no document horizontal overflow at 320/768/1024/1440; desktop dashboard client/scroll heights both **710px** at 1920x800.
- Follow-up result: `/app/test_reports/iteration_2_followup.json`.
- No application files were modified by the testing agent. Temporary test records were removed.

## Limitations / prioritized roadmap
### P0
- No known blockers in tested new preview flows. User visual verification is pending.

### P1 — next actions
- User review of new direction across main modules.
- Further hand-polish of specialized legacy screens (benefit rules, bank verification, office hierarchy, complex agreements, detailed E-card configuration) beyond the inherited shell/theme.
- Validate full live-backend workflows, permissions/navigation visibility and original role-specific behaviours when the real service stack is available.
- Connect new directory/dashboard adapters and create/edit actions to live service contracts before using the polished preview screens outside mock mode. Until then live mode intentionally retains the original page components.
- Full audit histories, real notifications, live access changes and document-storage actions are not implemented by this redesign.

### P2 — future
- Saved queue/filter views per operator would make repeat daily workflows faster.
- Continue bundle/code splitting; pre-existing large bundle and CSS-selector build warnings remain non-blocking.
- Refresh aged Browserslist database.
- Transient Recharts initial dimension warning and existing runtime-env placeholder warning remain non-blocking; charts render and resize correctly in tested views.

## Test credentials
See `/app/memory/test_credentials.md`. Preview requires no credential entry. Historic Keycloak credentials are not connected to a running IdP.