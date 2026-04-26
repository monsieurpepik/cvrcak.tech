# Welcome Screen — Design Spec
_Date: 2026-04-25_

## Goal

Replace the current role-picker welcome screen with a pure brand moment that requires zero decisions from the user. The screen exists to establish trust and remove all hesitation before the learning experience starts. It is the only screen ministry officials and 10-year-old students share — it must work for both.

## Flow

```
welcome.tsx  →  (Počni tapped)  →  /chapter
```

No home screen in the path. Welcome → Chapter is the complete Slice 1 demo flow.

## Screen Design

**Background:** `colors.cream2` (`#FDF6E8`)

**Center block (vertically centered, horizontally centered):**

1. **Logo** — 64×64px circle, `colors.ink` background, italic Georgia "C" in `colors.cream`
2. **Heading** — "Dobrodošli u Cvrčak" in Georgia serif 30px; "Cvrčak" italic in `colors.gold` (`#B87A2E`)
3. **Tagline** — 14px, `colors.textMuted`, max 260px wide, centered:
   > Znanje u džepu.
4. **CTA button** — full-width ink pill (max 280px), label "Počni" in cream, 600 weight. Routes to `/chapter` on press.

**Footer (pinned to bottom):**
- "cvrcak.ai" — 12px, `colors.textMuted`, centered
- _(School/grade context can be added here for specific deployments; default is brand domain)_

## HCD Rationale

| Principle | Applied |
|-----------|---------|
| Hick's Law | Single CTA — one thing to tap, zero decisions |
| Cognitive load | Logo + 2 sentences + 1 button; parseable in under 3 seconds |
| Progressive disclosure | No settings, no role picker, no onboarding steps on this screen |
| Context anchor | Footer grounds the screen for ministry officials without cluttering the kid's view |
| IDEO alignment | Ruthless simplification; screen does one job — establish trust |

## What Changes

- `app/welcome.tsx`: Remove role-picker UI; render brand screen above
- PostHog `role_selected` capture: remove (no role on this screen)
- Routing: `onPress` navigates to `/(tabs)/chapter` (or `/chapter` — confirm exact route name)

## What Does Not Change

- `app/index.tsx` (home screen) — untouched; not in Slice 1 demo path
- Audio player, chat drawer, Q&A — untouched
- Theme tokens — no new tokens needed; uses existing `colors`, `fonts`

## Out of Scope

- Animations / splash transition (can be added post-demo)
- Onboarding flow for new users
- Role-based routing (deferred to v1)
- Localization beyond Bosnian
