import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Snap Screen',
    description: 'Adds ability to take screen shot of video and also Records the current tab in an offscreen document.',
    version: '0.0.2',
    permissions: ['storage', 'activeTab', 'contextMenus', 'tabCapture', 'offscreen'],
    action: {
      default_icon: 'icons/record-128.png',
      default_title: 'Start video capture',
    },
    icons: {
      '128': 'icons/record-128.png',
    },
  },
});
