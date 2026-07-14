import { browser } from "wxt/browser";
import { getSnapStore } from "./store";
import type { SnapScreenMode, OffscreenMessage } from "./types";
import { transition } from "./fsm";

type Tab = Browser.tabs.Tab;

async function sendMessageToOffscreen(message: OffscreenMessage) {
  browser.runtime.sendMessage({
    ...message,
    target: "offscreen",
  });
}

async function createOffscreenDocument(tab: Tab): Promise<string> {
  const existingContexts = await browser.runtime.getContexts({});
  const offscreenDocument = existingContexts.find((c) => c.contextType === "OFFSCREEN_DOCUMENT");

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

export const CaptureController = {
  async setMode(mode: SnapScreenMode): Promise<void> {
    await transition({ type: "SELECT_MODE", mode });
  },

  async handleActionClick(tab: Tab): Promise<void> {
    const { snapScreenMode, recordingTab, captureDestination } = await getSnapStore();

    if (snapScreenMode === "SCREEN_CAPTURE") {
      try {
        if (recordingTab !== -1) {
          console.warn("Capture frame transition guard failed: recording active");
          return;
        }
        const streamId = await createOffscreenDocument(tab);
        sendMessageToOffscreen({
          type: "capture-frame",
          data: { streamId, destination: captureDestination },
        });
      } catch (e) {
        console.error("Failed to capture video frame:", e);
      }
      return;
    }

    if (snapScreenMode === "SCREEN_RECORD") {
      try {
        if (recordingTab === -1) {
          const streamId = await createOffscreenDocument(tab);
          await sendMessageToOffscreen({ type: "start-recording", data: streamId });
          await transition({ type: "START_RECORDING", tabId: tab.id! });
        } else if (recordingTab === tab.id) {
          await sendMessageToOffscreen({ type: "stop-recording" });
          await transition({ type: "STOP_RECORDING", tabId: tab.id });
        }
      } catch (e) {
        console.error("FSM transition failed for recording action:", e);
      }
      return;
    }
  },
};
