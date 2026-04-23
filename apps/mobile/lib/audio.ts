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
  await TrackPlayer.setupPlayer();
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
  artwork?: string;
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
