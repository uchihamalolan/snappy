import { browser } from "wxt/browser";

type Mode = "recording" | "streaming" | "gif";

// Global variables for storing recorder and recorded frames.
let recorder: MediaRecorder | undefined;
let data: Blob[] = [];

browser.runtime.onMessage.addListener((message) => {
	if (message.target !== "offscreen") return;

	switch (message.type) {
		case "start-recording":
			startRecording(message.data, { mode: "recording" });
			break;
		case "stop-recording":
			stopRecording();
			break;
		case "start-streaming":
			startRecording(message.data, { mode: "streaming" });
			break;
		case "stop-streaming":
			stopRecording();
			break;
		case "capture-frame":
			captureFrame(message.data);
			break;
		default:
			throw new Error("Unrecognized message type: " + message.type);
	}
});

async function startRecording(streamId: string, { mode }: { mode: Mode }) {
	if (recorder?.state === "recording") {
		throw new Error("Called startRecording while recording is in progress.");
	}

	const media = await navigator.mediaDevices.getUserMedia({
		audio: {
			// @ts-expect-error - mandatory is chrome specific
			mandatory: {
				chromeMediaSource: "tab",
				chromeMediaSourceId: streamId,
			},
		},
		video: {
			// @ts-expect-error - mandatory is chrome specific
			mandatory: {
				chromeMediaSource: "tab",
				chromeMediaSourceId: streamId,
			},
		},
	});

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

	// Stopping the tracks makes sure the recording icon in the tab is removed.
	recorder.stream.getTracks().forEach((t) => {
		t.stop();
	});

	// Update current state in URL
	window.location.hash = "";
}

async function captureFrame(streamId: string) {
	const media = await navigator.mediaDevices.getUserMedia({
		video: {
			// @ts-expect-error - mandatory is chrome specific
			mandatory: {
				chromeMediaSource: "tab",
				chromeMediaSourceId: streamId,
			},
		},
	});

	const videoEl = document.createElement("video");
	videoEl.srcObject = media;
	const track = media.getVideoTracks()[0];

	const imageCapture = new (window as any).ImageCapture(track);
	const imageBitmap = await (imageCapture as any).grabFrame();

	const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
	const context = canvas.getContext("2d");
	if (!context) return;
	context.drawImage(imageBitmap, 0, 0);

	const blob = await canvas.convertToBlob({ type: "image/webp" });
	const url = URL.createObjectURL(blob);

	// download the frame
	const a = document.createElement("a");
	a.href = url;
	a.download = "captured_image.webp";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	// cleanup
	track.stop();
}
export {};
