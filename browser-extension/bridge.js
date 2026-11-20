function isAllowedFGetMessage(event) {
  return event.source === window &&
    event.origin === window.location.origin &&
    event.data?.source === "fget-web";
}

window.addEventListener("message", (event) => {
  if (!isAllowedFGetMessage(event)) return;

  const request = event.data;
  const allowedTypes = new Set(["PING", "QUEUE_GET", "QUEUE_ADD", "QUEUE_CLEAR_COMPLETED"]);
  if (!allowedTypes.has(request.type)) return;

  chrome.runtime.sendMessage(request, (response) => {
    const runtimeError = chrome.runtime.lastError?.message;
    window.postMessage({
      source: "fget-extension",
      type: `${request.type}_RESULT`,
      requestId: request.requestId,
      available: !runtimeError && response?.available !== false,
      ...(runtimeError ? { error: "ส่วนขยายติดต่อระบบคิวไม่ได้" } : response || {}),
    }, event.origin);
  });
});
