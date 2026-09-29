import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

const notificationSoundAsset = require("@/assets/sound.mp3");

let player: AudioPlayer | null = null;

const getPlayer = () => {
  if (!player) {
    player = createAudioPlayer(notificationSoundAsset);
  }
  return player;
};

export const playNotificationSound = async () => {
  try {
    await setAudioModeAsync({ playsInSilentMode: false });
    const activePlayer = getPlayer();
    await activePlayer.seekTo(0);
    activePlayer.play();
  } catch {
    // ignore playback failures (e.g. player not ready)
  }
};
