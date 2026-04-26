# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Cvrčak mobile app. The `posthog-react-native` package was already installed and `PostHogProvider` was partially configured. The integration was completed and extended with additional event tracking across the welcome screen, home screen, standalone chat screen, and chapter/audio screen. Environment variables are now properly loaded from `.env` via Expo's `EXPO_PUBLIC_*` prefix, replacing the empty placeholder in `app.json`.

## Changes made

| File | Change |
|------|--------|
| `app/_layout.tsx` | Updated `PostHogProvider` to read API key and host from `EXPO_PUBLIC_POSTHOG_API_KEY` / `EXPO_PUBLIC_POSTHOG_HOST` env vars |
| `.env` | Created with `EXPO_PUBLIC_POSTHOG_API_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` |

## Events instrumented

| Event | Description | File |
|-------|-------------|------|
| `audio_started` | Audio playback begins for an episode | `app/chapter.tsx` (pre-existing) |
| `audio_completed` | User reaches within 5 s of the end of the audio | `app/chapter.tsx` (pre-existing) |
| `chat_opened` | Chat drawer opens from the audio screen (audio auto-pauses) | `components/ChatDrawer.tsx` (pre-existing) |
| `question_asked` | User submits a question in the chat drawer | `components/ChatDrawer.tsx` (pre-existing) |
| `citation_tapped` | User taps a citation chip to view the source excerpt | `components/CitationChip.tsx` (pre-existing) |
| `role_selected` | User selects a role (ucenik / roditelj / nastavnik) on the welcome screen | `app/welcome.tsx` (new) |
| `home_play_tapped` | User taps the play button or "Slušaj lekciju" link on the home screen | `app/index.tsx` (new) |
| `home_chat_tapped` | User taps the inline chat bar on the home screen | `app/index.tsx` (new) |
| `question_asked` | User submits a question via the standalone full-screen chat | `app/chat.tsx` (new, adds `source: "chat_screen"` property) |
| `transcript_toggled` | User expands or collapses the transcript section | `app/chapter.tsx` (new) |
| `download_tapped` | User taps the "Preuzmi za offline" button | `app/chapter.tsx` (new) |

## Next steps

We've built a dashboard and five insights to monitor user behavior:

**Dashboard**
- [Analytics basics](https://eu.posthog.com/project/165803/dashboard/641754)

**Insights**
- [Audio Conversion Funnel](https://eu.posthog.com/project/165803/insights/sFkCtZvw) — home_play_tapped → audio_started → audio_completed
- [Daily Audio Sessions](https://eu.posthog.com/project/165803/insights/0gx1Ld3z) — audio_started and audio_completed over time
- [Questions Asked per Day](https://eu.posthog.com/project/165803/insights/l0XIHjmf) — question_asked and citation_tapped over time
- [Chat Funnel: Opened to Question Asked](https://eu.posthog.com/project/165803/insights/nZEpaSN2) — chat_opened → question_asked conversion
- [Role Selection Breakdown](https://eu.posthog.com/project/165803/insights/Z9VTBGPI) — which roles users select at onboarding

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
