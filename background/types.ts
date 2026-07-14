export type SnapScreenMode = "SCREEN_RECORD" | "SCREEN_CAPTURE";
export type CaptureDestination = "DOWNLOAD" | "TAB";

export type SnapStore = {
  snapScreenMode: SnapScreenMode;
  recordingTab: number;
  captureDestination: CaptureDestination;
};

export type OffscreenMessage =
  | { type: "start-recording"; data: string }
  | { type: "stop-recording" }
  | { type: "capture-frame"; data: { streamId: string; destination: CaptureDestination } };
