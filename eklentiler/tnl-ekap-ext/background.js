// Service Worker for bypassing CORS

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncToLocalhost') {
    fetch('http://localhost:3000/api/ekap-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.payload)
    })
    .then(res => res.json())
    .then(data => {
      sendResponse({ success: true, data: data });
    })
    .catch(err => {
      console.error('Fetch error:', err);
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Indicates async response
  }
});
