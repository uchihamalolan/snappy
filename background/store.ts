import { browser } from "wxt/browser";
import type { SnapStore } from "./types";

export async function getSnapStore(): Promise<SnapStore> {
	const { snapScreenMode } = await browser.storage.local.get("snapScreenMode");
	const { recordingTab } = await browser.storage.local.get("recordingTab");
	return {
		snapScreenMode: snapScreenMode as any,
		recordingTab: recordingTab as any,
	};
}

export async function setSnapStore(value: Partial<SnapStore>) {
	await browser.storage.local.set(value);
}

export function setActionButton(path: string, title: string, _tabId: number | undefined) {
	browser.action.setIcon({ path });
	browser.action.setTitle({ title });
}
