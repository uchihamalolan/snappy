import { browser } from "wxt/browser";
import { captureStream, captureVideo, captureVideoFrame } from "../background/capture";
import { snapScreenKeys } from "../background/constants";
import { getSnapStore, setSnapStore } from "../background/store";
import { canProceed, updateIcon } from "../background/utils";

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
		browser.contextMenus.create({
			id: "SNAP_SCREEN_STREAM",
			title: "Stream ye heart",
			type: "radio",
			checked: false,
			contexts: ["action"],
		});

		setSnapStore({ snapScreenMode: "SCREEN_RECORD", recordingTab: -1 });
	});

	browser.contextMenus.onClicked.addListener(async (info) => {
		const { checked, menuItemId } = info;
		if (!checked) return;

		const { recordingTab } = await getSnapStore();
		if (recordingTab !== -1) return; // don't allow to change mode if recording

		switch (menuItemId) {
			case "SNAP_SCREEN_SCREENSHOT":
				return setSnapStore({ snapScreenMode: "SCREEN_CAPTURE" });
			case "SNAP_SCREEN_RECORD":
				return setSnapStore({ snapScreenMode: "SCREEN_RECORD" });
			case "SNAP_SCREEN_STREAM":
				return setSnapStore({ snapScreenMode: "SCREEN_STREAM" });
		}
	});

	browser.action.onClicked.addListener(async (tab) => {
		if (!canProceed(tab)) return;

		const { snapScreenMode } = await getSnapStore();

		switch (snapScreenMode) {
			case "SCREEN_CAPTURE":
				return captureVideoFrame(tab);
			case "SCREEN_RECORD":
				return captureVideo(tab);
			case "SCREEN_STREAM":
				return captureStream(tab);
		}
	});

	browser.storage.onChanged.addListener(async (changes) => {
		const changedKeys = Object.keys(changes);

		const shouldUpdateIcon = changedKeys.some((key) => snapScreenKeys.includes(key));

		if (shouldUpdateIcon) {
			const { snapScreenMode, recordingTab } = await getSnapStore();
			updateIcon({ snapScreenMode, recordingTab });
		}
	});
});
