function sendToNative(payload) {
  try {
    // Try ReactNativeWebView.postMessage first (the correct method for React Native WebView)
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      console.log("📤 Sending message via ReactNativeWebView.postMessage:", payload);
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      return;
    }
    
    // Fallback to window.postMessage (for testing or other contexts)
    if (window.isNativeApp && window.postMessage) {
      console.log("📤 Sending message via window.postMessage:", payload);
      window.postMessage(JSON.stringify(payload), '*');
      return;
    }
    
    console.debug("⚠️ Native bridge not available - isNativeApp:", window.isNativeApp, "ReactNativeWebView:", !!window.ReactNativeWebView, "payload:", payload);
  } catch (e) {
    console.error("❌ sendToNative error:", e, "payload:", payload);
  }
}

function onNativeMessage(handler) {
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

module.exports = {
  sendToNative,
  onNativeMessage
};
