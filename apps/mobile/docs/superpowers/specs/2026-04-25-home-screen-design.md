# Student Home Screen — Design Spec
_Date: 2026-04-25_

## Goal

Replace the redirect at `/` with a student home screen that acts as a study companion entry point. The child arrives here after the welcome screen and can either browse lessons or ask a question directly. Cvrčak assists kids — it does not replace school.

## Flow

```
Welcome (Počni) → Home (/) → tap play    → /chapter (audio player)
                            → tap chat bar → /chat
```

## Screen Design

### Header
- Small ink circle logo (32px) with italic "C"
- Greeting: "Zdravo, " + student name in `colors.accentWarm` italic (hardcoded "Marko" for Slice 1)
- Streak chip (right): popPeach pill, fire emoji + "12" in mono font

### Lesson Zone (top, scrollable)
Section label: "Lekcije" — 11px mono uppercase, `colors.ink3`

**Active episode card (dark):**
- Background: `colors.ink`
- Border radius: `radius.hero` (24px)
- Speaker chips: "N" (Nastavnica, popPeach background) + "M" (Marko, cream background), semi-transparent pill container
- Subject label: "Matematika 5 · Poglavlje 4" — 10px mono uppercase, `colors.accentWarm`
- Title: "Sabiranje razlomaka sa različitim nazivnicima" — `fonts.display`, 19px, white, lineHeight 1.3
- Duration: "~8 min" — 12px, `colors.muted`
- Play row: 44px popPeach circle with play icon + "Slušaj lekciju" (semibold, white) + "Audio pregled · 2 glasa" (12px, muted)
- Tapping anywhere on card or play button → `router.push("/chapter")`

**Coming-soon card (light, locked):**
- Background: `colors.cream3`, border: `colors.line`
- "Matematika 5 · Poglavlje 5" label + "Množenje razlomaka" title
- "Uskoro" badge in `colors.popLavender`
- Not tappable (opacity 0.6)

### Chat Zone (bottom, pinned)
Separated from lesson zone by `colors.line` top border.

Section label: "Pitaj pitanje" — 11px mono uppercase, `colors.ink3`

**Chat input bar:**
- White background, `colors.line` border, pill shape
- Placeholder: "Šta te muči danas?"
- Send button: 30px ink circle with up-arrow in cream
- Tapping anywhere on bar → `router.push("/chat")`

**Subtext:** "Pitaj o gradivu iz knjige · Cvrčak odgovara" — 11px, `colors.muted`, centered

## What Changes

- `app/index.tsx`: Replace `<Redirect href="/welcome" />` with the full home screen component
- `app/welcome.tsx`: `router.replace("/")` instead of `router.replace("/chapter")` — welcome now routes to home, not chapter directly

## What Does Not Change

- `app/chapter.tsx` — untouched
- `app/chat.tsx` — untouched
- `app/welcome.tsx` visual design — only the `onPress` route target changes

## Design notes

- This is v1.0 of the screen. Polish pass (spacing, animations, premium feel) is a separate iteration.
- Hardcoded student name "Marko" and streak "12" for Slice 1 demo. No auth.
- The coming-soon card signals to ministry officials this is a platform with more content coming.

## Out of Scope

- Real lesson list from database (hardcoded for Slice 1)
- Streak logic
- Progress bars per lesson
- Search
- Subject switching
