export function isValidUrl(url: string) {
  const allowedVideoUrls = [
    // with www
    "www.netflix.com",
    "www.hotstar.com",
    "www.primevideo.com",
    "www.zee5.com",
    "www.sonyliv.com",
    "www.sunnxt.com",
    "www.youtube.com",

    // without www
    "netflix.com",
    "hotstar.com",
    "primevideo.com",
    "zee5.com",
    "sonyliv.com",
    "sunnxt.com",
    "developer.chrome.com",
    "youtube.com",
  ];

  return allowedVideoUrls.includes(url);
}

export function canProceed(tab: Browser.tabs.Tab) {
  if (!tab?.url || !tab?.id) {
    console.error("Tab is not valid");
    return false;
  }

  const url = new URL(tab.url);
  if (!isValidUrl(url.hostname)) {
    return false;
  }

  return true;
}
