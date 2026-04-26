// Single source of truth for lazy-loading react-native-track-player.
// All components import from here instead of copy-pasting the try/catch block.
let TrackPlayer: any = null;
let useProgress: () => { position: number; duration: number; buffered: number } = () => ({
  position: 0,
  duration: 0,
  buffered: 0,
});
let usePlaybackState: () => { state: string } = () => ({ state: "" });
let State = { Playing: "playing" };

try {
  const tp = require("react-native-track-player");
  TrackPlayer = tp.default;
  useProgress = tp.useProgress;
  usePlaybackState = tp.usePlaybackState;
  State = tp.State;
} catch {
  // Running in Expo Go — audio is disabled
}

export { TrackPlayer, useProgress, usePlaybackState, State };
