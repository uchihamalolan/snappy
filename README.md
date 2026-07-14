# Snap Screen (snappy)

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/uchihamalolan/snappy?style=flat-square)](https://github.com/uchihamalolan/snappy/releases/latest)

A lightweight, modern Google Chrome extension built with the **WXT** framework. It provides secure tab recording and high-fidelity video frame screenshots designed to bypass basic "soft" DRM restrictions using Chrome's tab capture and offscreen documents API.

## Features

- **Action Mode Transitions**: Toggle between recording and frame screenshot modes.
- **Subtle DRM Bypassing**: Uses privileged tab capture streams (`chrome.tabCapture`) via offscreen documents to bypass traditional CSS/overlay screenshot blockers.
- **Enhanced Screenshot Quality**:
  - Automatically targets high-resolution WebRTC streams.
  - Uses high-quality canvas smoothing configurations.
  - Applies color contrast and saturation adjustments (`context.filter`) to correct washed-out colors common to WebRTC.
- **Flexible Destinations**:
  - **Save screenshot to disk**: Saves as WebP (at quality `0.98`) to save space while retaining lossless-like fidelity.
  - **Open screenshot in new tab**: Renders the screenshot as a lossless PNG blob URL in a new tab, allowing convenient copy-to-clipboard or inspections.

## Installation

To install Snap Screen manually in Google Chrome without using the Chrome Web Store:

1. Download the latest `.zip` file from the project's releases page.
2. Extract the downloaded zip file into a folder on your computer.
3. Open Google Chrome and navigate to `chrome://extensions/` (or click Chrome menu -> **Extensions** -> **Manage Extensions**).
4. Turn on **Developer mode** using the toggle switch in the top-right corner.
5. Click the **Load unpacked** button in the top-left corner.
6. Select the extracted folder to load and install the extension.

## How It Works

1. Right-clicking the extension icon opens the context menu where you can choose:
   - **Mode**: *Record screen* or *Take a screenshot*.
   - **Destination**: *Save screenshot to disk* or *Open screenshot in new tab*.
2. Clicking the extension button triggers the active mode:
   - In recording mode: Sets badge state to indicate active status and captures WebM video.
   - In screenshot mode: Captures the active tab stream, extracts the image bitmap using the `ImageCapture` API, enhances colors, and saves/opens according to destination settings.
