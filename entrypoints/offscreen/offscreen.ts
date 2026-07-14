import { browser } from "wxt/browser";

type Mode = "recording" | "gif";

// Global variables for storing recorder and recorded frames.
let recorder: MediaRecorder | undefined;
let data: Blob[] = [];

function getTabStream(streamId: string, options: { audio?: boolean } = {}): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: options.audio
      ? {
          mandatory: {
            chromeMediaSource: "tab",
            chromeMediaSourceId: streamId,
          },
        }
      : false,
    video: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
        minWidth: 1920,
        minHeight: 1080,
        maxWidth: 3840,
        maxHeight: 2160,
      },
    },
  });
}

function stopMediaStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

function downloadUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function startRecording(streamId: string, { mode }: { mode: Mode }) {
  if (recorder?.state === "recording") {
    throw new Error("Called startRecording while recording is in progress.");
  }

  const media = await getTabStream(streamId, { audio: true });

  // Continue to play the captured audio to the user.
  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);

  // Start recording.
  recorder = new MediaRecorder(media, { mimeType: "video/webm" });

  recorder.ondataavailable = (event) => {
    if (mode === "recording") {
      data.push(event.data);
    }
  };

  recorder.onstop = async () => {
    // if recording, open it in new tab as blob url
    if (mode === "recording") {
      const blob = new Blob(data, { type: "video/webm" });
      window.open(URL.createObjectURL(blob), "_blank");
    }

    // Clear state ready for next recording
    recorder = undefined;
    data = [];
  };

  recorder.start();

  // Record the current state in the URL. This provides a very low-bandwidth
  // way of communicating with the service worker.
  window.location.hash = "recording";
}

async function stopRecording() {
  if (!recorder) return;

  recorder.stop();
  stopMediaStream(recorder.stream);

  // Update current state in URL
  window.location.hash = "";
}

async function captureFrame(streamId: string, destination: "DOWNLOAD" | "TAB" = "DOWNLOAD") {
  const media = await getTabStream(streamId, { audio: false });

  const videoEl = document.createElement("video");
  videoEl.srcObject = media;
  const track = media.getVideoTracks()[0];

  const imageCapture = new (window as any).ImageCapture(track);
  const imageBitmap = await (imageCapture as any).grabFrame();

  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const context = canvas.getContext("2d");
  if (!context) return;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = "contrast(1.03) saturate(1.05)";
  context.drawImage(imageBitmap, 0, 0);

  if (destination === "TAB") {
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const url = URL.createObjectURL(blob);
    browser.runtime.sendMessage({ type: "open-tab", url });
  } else {
    const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.98 });
    const url = URL.createObjectURL(blob);
    downloadUrl(url, "captured_image.webp");
  }

  stopMediaStream(media);
}

function init() {
  browser.runtime.onMessage.addListener((message) => {
    if (message.target !== "offscreen") return;

    switch (message.type) {
      case "start-recording":
        startRecording(message.data, { mode: "recording" });
        break;
      case "stop-recording":
        stopRecording();
        break;
      case "capture-frame":
        captureFrame(message.data.streamId, message.data.destination);
        break;
      default:
        throw new Error("Unrecognized message type: " + message.type);
    }
  });
}

init();
