import { getSnapStore, setSnapStore } from "./store";
import type { SnapScreenMode } from "./types";

type FsmAction =
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
