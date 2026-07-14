import type { SnapStore } from "./types";

export const snapScreenKeys: string[] = [
	"snapScreenMode",
	"recordingTab",
] satisfies (keyof SnapStore)[];
