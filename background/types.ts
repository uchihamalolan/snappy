export type SnapScreenMode = "SCREEN_RECORD" | "SCREEN_CAPTURE" | "SCREEN_STREAM";

export type SnapStore = {
	snapScreenMode: SnapScreenMode;
	recordingTab: number;
};

export type MessageType =
	| "capture-frame"
	| "start-recording"
	| "stop-recording"
	| "start-streaming"
	| "stop-streaming";
