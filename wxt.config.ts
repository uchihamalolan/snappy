import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Snap Screen",
    description:
      "Adds ability to take screen shot of video and also Records the current tab in an offscreen document.",
    version: "0.0.1",
    permissions: ["storage", "activeTab", "contextMenus", "tabCapture", "offscreen", "scripting"],
    action: {
      default_icon: "icons/record-128.png",
      default_title: "Start video capture",
    },
    icons: {
      "16": "icons/record-128.png",
      "32": "icons/record-128.png",
      "48": "icons/record-128.png",
      "128": "icons/record-128.png",
    },
    commands: {
      "trigger-action": {
        suggested_key: {
          default: "Alt+Shift+S",
          mac: "Alt+Shift+S",
        },
        description: "Trigger screenshot or start/stop recording",
      },
    },
  },
});
