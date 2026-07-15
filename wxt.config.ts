import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  imports: false,
  srcDir: "src",
  manifest: {
    name: "Snappy",
    version: "0.0.1",
    description: "Take screen shot of video and also record the current tab to bypass soft DRM",
    permissions: ["storage", "activeTab", "contextMenus", "tabCapture", "offscreen", "scripting"],
    action: {
      default_icon: "icons/record-128.png",
      default_title: "Start video capture",
    },
    icons: {
      16: "icons/record-128.png",
      32: "icons/record-128.png",
      48: "icons/record-128.png",
      128: "icons/record-128.png",
    },
    commands: {
      "trigger-action": {
        suggested_key: {
          default: "Alt+Shift+S",
          mac: "Alt+Shift+S",
        },
        description: "Trigger screenshot or start/stop recording",
      },
    }
  },
});
