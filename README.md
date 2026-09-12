# EcoCycle — household + collector frontend

One Ionic React + TypeScript codebase that builds **two separate apps** for
EcoCycle:

| App                  | Who it's for  | Dev host                                | Web bundle            | Capacitor appId (Android flavor / iOS scheme) |
|----------------------|---------------|------------------------------------------|-----------------------|------------------------------------------------|
| **EcoCycle**                   | Households    | `npm run dev:household` (port 5173)      | `dist/household/`     | `co.za.ecocycle.household` (household) |
| **EcoCycle Collector**         | Collectors    | `npm run dev:collector` (port 5174)      | `dist/collector/`     | `co.za.ecocycle.collector` (collector) |

Both targets share the same Ionic component library, the same design tokens
and the same Tailwind theme, **but the code they can see is different**. Each
`dist/` bundle only contains the screens and data for its persona — verified
by guards in CI. One Capacitor project holds both apps behind Android product
flavors (`household` / `collector`) and an iOS scheme per target.

## Stack

- Ionic React (via `@ionic/react`, Ionic 8) — mobile UI, tabs, modals
- Vite (5) — dev server + build tool, one config per target
- TypeScript (strict, project references)
- Tailwind CSS
- React Router v5 (via `@ionic/react-router`)
- Recharts — the household monthly waste bar chart
- lucide-react / ionicons — icons
- Capacitor 8 — native Android + iOS wrappers
- ESLint (8) + `@typescript-eslint` — linting, including feature-boundary rules

## Commands

|Command|What it does|
|---|---|
|`npm install`|Install dependencies (once)|
|`npm run dev:household`|Dev server for **household** (http://localhost:5173)|
|`npm run dev:collector`|Dev server for **collector** (http://localhost:5174)|
|`npm run typecheck`|Type-check the whole project (no emit)|
|`npm run lint`|ESLint over `src/` — blocks cross-feature imports (see Guardrails)|
|`npm run build:household`|Build **household** -> `dist/household/`|
|`npm run build:collector`|Build **collector** -> `dist/collector/`|
|`npm run build`|Build both targets|
|`npm run preview:household`|Preview the built household bundle|
|`npm run preview:collector`|Preview the built collector bundle|

### Native (Capacitor) commands

Capacitor targets are selected by the **`APP_TARGET` environment variable**.
Set it in the shell, or prefix any of these commands:

|Command|What it does|
|---|---|
|`APP_TARGET=household npx cap sync`|Sync household web build into the native projects|
|`APP_TARGET=collector npx cap sync`|Sync collector web build into the native projects|
|`APP_TARGET=household npx cap open android`|Open the household app in Android Studio|
|`APP_TARGET=collector npx cap open android`|Open the collector app in Android Studio|
|`npx cap copy household` / `npx cap copy collector`|Copy the web assets (default target)|
|`npx cap run android`|Live-reload run on a connected device/emulator|

`APP_TARGET` decides which `webDir`, appId, Android flavor and iOS scheme the
native layer uses. If it's not set, it defaults to `household`.

## Everything lives in `src/`

```
src/
  shared/                  # code every target shares — must be persona-agnostic
    theme/tokens.ts          design tokens (colors, fonts)
    theme/tokensDefine.ts    waste category tokens
    theme/tailwind.css       Tailwind entry
    types/                   AppUser and friends
    data/                    shared mock data (users, auth support)
    components/              Button, Card, TextField, AppHeader, UserMenu,
                             OtpModal, NotificationBell, ...
    layout/                  AppLayout + AuthLayout
    context/                 AuthContext (mock OTP auth)
    assets/                  logo
    pages/                   Login, Sign up, Placeholder
  features/
    household/               # ---- THE HOUSEHOLD APP ----
      Tabs.tsx               household tab bar + routes
      data/                  household-only mock data (waste, wallet, banks)
      pages/                 Home, Waste Inventory, Wallet, Education, ...
    collector/               # ---- THE COLLECTOR APP ----
      Tabs.tsx               collector tab bar + routes
      data/                  collector-only mock data (pickups, earnings)
      pages/                 Pickup Queue, Active Route, Earnings, ...
  App.household.tsx          household router/entry
  main.household.tsx         household bootstrap
  App.collector.tsx          collector router/entry
  main.collector.tsx         collector bootstrap
```

### Why it's split this way

Each "feature" is a self-contained slice that can own its own data layer,
pages and tab bar. `shared/` is the neutral ground: design tokens, auth, the
layout shells and reusable components that have no opinion about which app
you're in出的. Because the boundary is enforced by tooling, adding a
household screen can never accidentally leak into a collector build (and vice
versa) — which is how both apps stay small and shippable independently.

## Deciding where code goes

Ask “which app needs this?”:

1. **Both apps, or app-agnostic plumbing?** → `src/shared/`. That's the
   default for anything new until it proves persona-specific — tokens,
   Button/Card, AppLayout, auth, shared mock data.
2. **Household only** (logging waste, wallet, education) → `src/features/household/`.
3. **Collector only** (pickup queue, active route, earnings) → `src/features/collector/`.

Rule of thumb: put it in `shared/` first; move it into a feature the moment
it starts importing from a feature folder or becomes clearly role-specific.
A file in `collector/` that reachs into `household/` is a defect.

## Guardrails (how the two apps stay honest)

1. **Boundary lint rules** (`no-restricted-imports` in `.eslintrc.cjs`):
   - `src/shared/**` may not import from `src/features/**`.
   - household must not import from collector, and collector must not import
     from household (each feature is an island that only touches `shared/**`).
2. **Bundle exclusion is verified by the build itself.** Because household
   and collector each have their own Vite entry HTML, the other app's code is
   tree-shaken out. CI greps each `dist/` folder to prove it:
   - `dist/household/` must not reference collector screens
     (`grep -l "PickupQueueScreen\|ActiveRouteScreen\|EarningsScreen" dist/household` → nothing)
   - `dist/collector/` must not reference household screens
     (`grep -l "WasteInventoryScreen\|WalletScreen" dist/collector` → nothing)
3. **No runtime role flag.** There is deliberately **no** `role`/`target`
   switch in the shared code. Which app you get is decided at **build time**
   by the entry point, never at runtime — so dead-household code can't silently
   ship inside the collector APK.

### ESLint boundary configuration

`.eslintrc.cjs` sets `files`-scoped `no-restricted-imports` overrides:

- `src/shared/**` → blocked from importing `**/features/**`.
- household files (`src/features/household/**` + household entries) → blocked
  from importing `**/features/collector/**` (and the collector entries).
- collector files (`src/features/collector/**` + collector entries) → blocked
  from importing `**/features/household/**` (and the household entries).

`npm run lint` runs after every `build` in CI. If someone wires the wrong
feature together, lint fails — before anything ships.

## Routes

### Household (`App.household.tsx`)

| Path | Screen |
|---|---|
| `/login` | Login |
| `/signup` | Sign up |
| `/tabs` | Tabbed area (Home / Waste Inventory / Wallet / Education) |
| `/account/*` | Edit profile / settings (placeholders) |
| `/support` | Support (placeholder) |

### Collector (`App.collector.tsx`)

| Path | Screen |
|---|---|
| `/tabs` | Tabbed area (Pickup Queue / Active Route / Earnings) |
| `/tabs/queue` | Pickup queue (default tab) |
| `/tabs/route` | Currently active route |
| `/tabs/earnings` | Earnings + payout history |

The collector app has no login/signup flow yet (a placeholder header user is
used); it's the same `AuthProvider::AuthProvider` mock-auth shell as household,
minus the auth screens.

## Notable decisions

- **Separate entry points, not runtime branching.** You can't end up with a
  hybrid app — the build physically can't include the other feature.
- **Capacitor target-awareness via `APP_TARGET`.** One `capacitor.config.ts`,
  read differently per target so `cap sync/open/run <target>` always operates
  on the right appId, webDir, flavor and scheme.
- **Android product flavors + iOS scheme per target.** Both apps live in one
  Capacitor project (`android/` + `ios/`), so native upgrades (gradle versions,
  Capacitor core) happen in one place, while the packaged application differs
  by `applicationId` and label.
- **Design tokens are plain-hex TS constants** (`shared/theme/tokens.ts`), not
  Ionic CSS variables — Tailwind utilities (`bg-moss`, `text-kraft`) and inline
  styles both read the same `COLORS` object, so chart fills and accents stay in
  sync.
- **Mock data lives next to the feature that owns it** (`features/*/data/`),
  keeping the demo self-contained until real auth/API lands. Household mock
  auth lives in `shared/context/` because both the isolate flow and the
  collector target reuse the same `AuthProvider` pattern.

## Sample accounts

Household login is mocked — use any of:

| Cellphone | Password |
|---|---|
| `0821234567` | `ecocycle1` |
| `0739876543` | `ecocycle2` |
| `0614567890` | `ecocycle3` |

The household OTP hint (shown on the login screen) is the shared mock OTP;
OTP verification accepts the per-flow demo codes surfaced in the modal.

## Tests / CI shape

A single GitHub Actions workflow runs on every push/PR:

```yaml
jobs:
  verify:
    - npm ci
    - npm run typecheck
    - npm run lint
    - npm run build          # builds dist/household + dist/collector
    - grep guards (see Guardrails) to prove each bundle stays persona-clean
```

Until real backend/auth exists, everything is UI-only demo data — swap each
`MOCK_*` import for a real API call as endpoints come online.

## Requirements

- Node.js 18+ (20 recommended)
- npm 9+
- Ionic CLI is not required (scripts handle it via Vite); Capacitor CLI comes
  via the `@capacitor/*` dev dependencies.
