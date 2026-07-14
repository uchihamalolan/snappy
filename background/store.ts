import { browser } from "wxt/browser";
import type { SnapScreenMode } from "./types";

type SnapStore = {
  snapScreenMode: SnapScreenMode;
  recordingTab: number;
};

type SnapScreenModeKey = Pick<SnapStore, "snapScreenMode">;
type recordingTabKey = Pick<SnapStore, "recordingTab">;

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
