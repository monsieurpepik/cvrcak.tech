let TrackPlayer: any = null;
let Capability: any = {};
let AppKilledPlaybackBehavior: any = {};

try {
  const tp = require("react-native-track-player");
  TrackPlayer = tp.default;
  Capability = tp.Capability;
  AppKilledPlaybackBehavior = tp.AppKilledPlaybackBehavior;
} catch {
  // Running in Expo Go -- audio not available
}

export async function setupPlayer() {
  if (!TrackPlayer) return;
  try {
    await TrackPlayer.setupPlayer();
  } catch (e: any) {
    // Already initialized (e.g. Fast Refresh) — safe to continue
    if (!e?.message?.includes("already been initialized")) throw e;
    return;
  }
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
  });
}

type Episode = {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string | number;
};

export async function loadEpisode(episode: Episode) {
  if (!TrackPlayer) return;
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: episode.id,
    url: episode.url,
    title: episode.title,
    artist: episode.artist,
    artwork: episode.artwork,
  });
}
