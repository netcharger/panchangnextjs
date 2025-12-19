export function sendToNative(payload) {
  try {
    if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    } else {
      console.debug("Native bridge not available", payload);
    }
  } catch (e) {
    console.error("sendToNative error", e);
  }
}

export function onNativeMessage(handler) {
  function listener(event) {
    const data = event?.data ?? event?.detail ?? null;
    try {
      const payload = typeof data === "string" ? JSON.parse(data) : data;
      handler(payload);
    } catch (err) {
      console.warn("onNativeMessage parse error", err, data);
    }
  }
  window.addEventListener("message", listener);
  document.addEventListener("message", listener);
  return () => {
    window.removeEventListener("message", listener);
    document.removeEventListener("message", listener);
  };
}
