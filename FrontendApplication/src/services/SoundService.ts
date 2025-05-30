type GameSound = "win" | "loss" | "draw" | "move" | "capture" | "notify" | "game_begin";

const SOUND_PATHS: Record<GameSound, string> = {
  win: "/sounds/win.wav",
  loss: "/sounds/loss.wav",
  draw: "/sounds/draw.wav",
  move: "/sounds/regular_move.mp3",
  capture: "/sounds/capture.mp3",
  notify: "/sounds/notify.mp3",
  game_begin: "/sounds/game_begin_drum.wav"
};

export class SoundService {
  static play(sound: GameSound, volume = 0.5) {
    const audio = new Audio(SOUND_PATHS[sound]);
    audio.volume = volume;
    audio.play().catch(console.error);
  }
}