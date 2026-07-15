import { browser } from "wxt/browser";
import { CaptureController } from "../common/capture";
import { setSnapStore } from "../common/store";
import { canProceed } from "../common/utils";
import type { SnapStore } from "../common/types";

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
      id: "SNAP_DEST_SEPARATOR",
      type: "separator",
      contexts: ["action"],
    });

    browser.contextMenus.create({
      id: "SNAP_DEST_DOWNLOAD",
      title: "Save screenshot to disk",
      type: "radio",
      checked: true,
      contexts: ["action"],
    });
    browser.contextMenus.create({
      id: "SNAP_DEST_TAB",
      title: "Open screenshot in new tab",
      type: "radio",
      checked: false,
      contexts: ["action"],
    });

    // setting initial state
    setSnapStore({
      snapScreenMode: "SCREEN_CAPTURE",
      recordingTab: -1,
      captureDestination: "TAB",
    } satisfies SnapStore);
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
        case "SNAP_DEST_DOWNLOAD":
          await setSnapStore({ captureDestination: "DOWNLOAD" });
          break;
        case "SNAP_DEST_TAB":
          await setSnapStore({ captureDestination: "TAB" });
          break;
      }
    } catch (e) {
      console.error("Failed to transition mode or destination:", e);
    }
  });

  browser.action.onClicked.addListener(async (tab) => {
    if (!canProceed(tab)) return;
    void CaptureController.handleActionClick(tab);
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "open-tab") {
      browser.tabs.create({ url: message.url });
    }
  });

  browser.commands.onCommand.addListener(async (command) => {
    if (command === "trigger-action") {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        if (tab && canProceed(tab)) {
          void CaptureController.handleActionClick(tab);
        }
      } catch (e) {
        console.error("Failed handling shortcut command:", e);
      }
    }
  });
});
