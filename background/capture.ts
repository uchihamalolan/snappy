import { browser } from "wxt/browser";
import { getSnapStore, setSnapStore } from "./store";
import type { MessageType } from "./types";

type ChromeTab = chrome.tabs.Tab;

async function sendMessageToOffscreen({
	type,
	streamId,
}: {
	type: MessageType;
	streamId?: string;
}) {
	browser.runtime.sendMessage({
		type,
		target: "offscreen",
		data: streamId,
	});
}

async function createOffscreenDocument(tab: ChromeTab): Promise<string> {
	const existingContexts = await browser.runtime.getContexts({});
	const offscreenDocument = existingContexts.find((c) => c.contextType === "OFFSCREEN_DOCUMENT");

	// If an offscreen document is not already open, create one.
	if (!offscreenDocument?.documentUrl) {
		await browser.offscreen.createDocument({
			url: "offscreen.html",
			reasons: ["USER_MEDIA" as any],
			justification: "Recording from chrome.tabCapture API",
		});
	}

	const streamId = await (browser.tabCapture as any).getMediaStreamId({
		targetTabId: tab.id,
	});

	return streamId;
}

async function startWork(type: MessageType, tab: ChromeTab) {
	const streamId = await createOffscreenDocument(tab);
	await sendMessageToOffscreen({ type, streamId });
	await setSnapStore({ recordingTab: tab.id });
}

async function stopWork(type: MessageType) {
	await sendMessageToOffscreen({ type });
	await setSnapStore({ recordingTab: -1 });
}

// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------

export async function captureVideoFrame(tab: ChromeTab) {
	const streamId = await createOffscreenDocument(tab);
	sendMessageToOffscreen({ type: "capture-frame", streamId });
}

export async function captureVideo(tab: ChromeTab) {
	const { snapScreenMode, recordingTab } = await getSnapStore();

	// if not in recording mode, then exit
	if (snapScreenMode !== "SCREEN_RECORD") return;

	// if not recording, then start new recording
	if (recordingTab === -1) {
		await startWork("start-recording", tab);
		return;
	}

	// if already recording, then stop recording
	if (recordingTab === tab.id) {
		await stopWork("stop-recording");
		return;
	}
}

export async function captureStream(tab: ChromeTab) {
	const { snapScreenMode, recordingTab } = await getSnapStore();

	// if not in streaming mode, then exit
	if (snapScreenMode !== "SCREEN_STREAM") return;

	if (recordingTab === -1) {
		await startWork("start-streaming", tab);
		return;
	}

	if (recordingTab === tab.id) {
		await stopWork("stop-streaming");
		return;
	}
}
