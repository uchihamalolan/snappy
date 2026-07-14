declare global {
  interface MediaTrackConstraints {
    mandatory?: {
      chromeMediaSource?: string;
      chromeMediaSourceId?: string;
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
    };
  }
}
export {};
