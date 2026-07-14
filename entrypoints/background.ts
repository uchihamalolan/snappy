import { browser } from "wxt/browser";
import { CaptureController } from "../background/capture";
import { setSnapStore } from "../background/store";
import { canProceed } from "../background/utils";

export default defineBackground(() => {
	browser.runtime.onInstalled.addListener(async () => {
		browser.contextMenus.create({
			id: "SNAP_SCREEN_RECORD",
			title: "Record screen",
			type: "radio",
			checked: true,
			contexts: ["action"],
		});
		browser.contextMenus.create({
			id: "SNAP_SCREEN_SCREENSHOT",
			title: "Take a screenshot",
			type: "radio",
			checked: false,
			contexts: ["action"],
		});

		// setting initial state
		setSnapStore({ snapScreenMode: "SCREEN_RECORD", recordingTab: -1 });
	});

	browser.contextMenus.onClicked.addListener(async (info) => {
		const { checked, menuItemId } = info;
		if (!checked) return;

		try {
			switch (menuItemId) {
				case "SNAP_SCREEN_SCREENSHOT":
					await CaptureController.setMode("SCREEN_CAPTURE");
					break;
				case "SNAP_SCREEN_RECORD":
					await CaptureController.setMode("SCREEN_RECORD");
					break;
			}
		} catch (e) {
			console.error("Failed to transition mode:", e);
		}
	});

	browser.action.onClicked.addListener(async (tab) => {
		if (!canProceed(tab)) return;
		void CaptureController.handleActionClick(tab);
	});
});
