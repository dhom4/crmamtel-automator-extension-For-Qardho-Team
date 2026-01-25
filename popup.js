// Track active requests to avoid overlapping actions
let isRunning = false;

async function run(fn, args = []) {
  if (isRunning) return; // Ignore if already running

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  isRunning = true;
  // Re-enable after 3 seconds (adjust if needed)
  setTimeout(() => { isRunning = false; }, 3000);

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (name, params) => window[name]?.(...params),
    args: [fn, args]
  }).catch(err => {
    console.error("Script error:", err);
    isRunning = false; // Unlock on error
  });
}

// Helper to bind buttons safely
function bindButton(id, fn, args = []) {
  document.getElementById(id)?.addEventListener('click', () => run(fn, args));
}

bindButton('page1', 'page1');
bindButton('page2', 'page2');
bindButton('retry', 'retryIccidSelection');
bindButton('next', 'next');
document.getElementById('generateReport')?.addEventListener('click', () => {
  if (isRunning) return;
  const format = document.getElementById('reportFormat').value;
  run('generateActivationReport', [format]);
});
