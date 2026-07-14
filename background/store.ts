import { browser } from "wxt/browser";
import type { SnapScreenMode } from "./types";

export type SnapStore = {
	snapScreenMode: SnapScreenMode;
	recordingTab: number;
};

type SnapScreenModeKey = Pick<SnapStore, "snapScreenMode">
type recordingTabKey = Pick<SnapStore, "recordingTab">

export async function getSnapStore(): Promise<SnapStore> {
	const { snapScreenMode } = await browser.storage.local.get<SnapScreenModeKey>("snapScreenMode");
	const { recordingTab } = await browser.storage.local.get<recordingTabKey>("recordingTab");
	return {
		snapScreenMode: snapScreenMode,
		recordingTab: recordingTab,
	};
}

export async function setSnapStore(value: Partial<SnapStore>) {
	await browser.storage.local.set(value);
	void updateIcon();
}

export type FsmAction =
	| { type: "SELECT_MODE"; mode: SnapScreenMode }
	| { type: "START_RECORDING"; tabId: number }
	| { type: "STOP_RECORDING"; tabId: number }
	| { type: "CAPTURE_FRAME"; tabId: number };

export async function transition(action: FsmAction): Promise<void> {
	const store = await getSnapStore();
	switch (action.type) {
		case "SELECT_MODE":
			if (store.recordingTab !== -1) {
				throw new Error("Cannot change mode while recording is active");
			}
			await setSnapStore({ snapScreenMode: action.mode });
			break;

		case "START_RECORDING":
			if (store.recordingTab !== -1) {
				throw new Error("Already recording a tab");
			}
			if (store.snapScreenMode !== "SCREEN_RECORD") {
				throw new Error("Not in recording mode");
			}
			await setSnapStore({ recordingTab: action.tabId });
			break;

		case "STOP_RECORDING":
			if (store.recordingTab !== action.tabId) {
				throw new Error("Tab is not currently being recorded");
			}
			await setSnapStore({ recordingTab: -1 });
			break;

		case "CAPTURE_FRAME":
			if (store.recordingTab !== -1) {
				throw new Error("Cannot capture frame while recording is active");
			}
			if (store.snapScreenMode !== "SCREEN_CAPTURE") {
				throw new Error("Not in screenshot mode");
			}
			break;
	}
}

async function updateIcon() {
	const { snapScreenMode, recordingTab } = await getSnapStore();
	const active = recordingTab !== -1;

	switch (snapScreenMode) {
		case "SCREEN_RECORD":
			setActionButton(
				active ? "/icons/recording-128.png" : "/icons/record-128.png",
				active ? "Stop recording" : "Start recording",
				recordingTab,
			);
			break;
		case "SCREEN_CAPTURE":
			setActionButton("/icons/camera-128.png", "Take screenshot", recordingTab);
			break;
	}
}

function setActionButton(path: string, title: string, _tabId: number | undefined) {
	browser.action.setIcon({ path });
	browser.action.setTitle({ title });
}
