import { setActionButton } from "./store";
import type { SnapStore } from "./types";

export function isValidUrl(url: string) {
	const allowedVideoUrls = [
		// with www
		"www.netflix.com",
		"www.hotstar.com",
		"www.primevideo.com",
		"www.zee5.com",
		"www.sonyliv.com",
		"www.sunnxt.com",
		"www.youtube.com",

		// without www
		"netflix.com",
		"hotstar.com",
		"primevideo.com",
		"zee5.com",
		"sonyliv.com",
		"sunnxt.com",
		"developer.chrome.com",
		"youtube.com",
	];

	return allowedVideoUrls.includes(url);
}

export function canProceed(tab: chrome.tabs.Tab) {
	if (!tab?.url || !tab?.id) {
		console.error("Tab is not valid");
		return false;
	}

	const url = new URL(tab.url);
	if (!isValidUrl(url.hostname)) {
		console.error("URL is not valid", url.hostname);
		return false;
	}

	return true;
}

export function updateIcon({ snapScreenMode, recordingTab }: SnapStore) {
	const isRecording = recordingTab !== -1;

	switch (snapScreenMode) {
		case "SCREEN_RECORD":
			setActionButton(
				isRecording ? "/icons/recording-128.png" : "/icons/record-128.png",
				isRecording ? "Stop recording" : "Start recording",
				recordingTab,
			);
			break;
		case "SCREEN_STREAM":
			setActionButton(
				isRecording ? "/icons/streaming-128.png" : "/icons/stream-128.png",
				isRecording ? "Stop streaming" : "Start streaming",
				recordingTab,
			);
			break;
		case "SCREEN_CAPTURE":
			setActionButton("/icons/camera-128.png", "Take screenshot", recordingTab);
			break;
	}
}
