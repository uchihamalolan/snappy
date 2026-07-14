declare global {
	interface MediaTrackConstraints {
		mandatory?: {
			chromeMediaSource?: string;
			chromeMediaSourceId?: string;
		};
	}
}
export {};
