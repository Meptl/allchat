// Disable X-Frame-Option to enable embedding of websites.
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const headers = details.responseHeaders.filter(header =>
      !["x-frame-options", "content-security-policy"].includes(header.name.toLowerCase())
    );

    headers.push({
      name: "Content-Security-Policy",
      value: `frame-ancestors ${chrome.runtime.getURL("")}`
    });

    return { responseHeaders: headers };
  },
  {
      urls: [
          "https://chatgpt.com/*",
          "https://claude.ai/*",
          "https://chat.deepseek.com/*",
          "https://gemini.google.com/*",
          "https://www.perplexity.ai/*",
          "https://v0.dev/*",
          "https://loveable.dev/*"
      ],
    types: ["sub_frame"]
  },
  ["blocking", "responseHeaders"]
);

const storage = chrome.storage || browser.storage;
const inputElement = document.getElementById('input');
const iframeContainer = document.getElementById('iframes-container');
const checkboxes = document.querySelectorAll('#checkboxes input[type="checkbox"]');


// Support query parameter for the search.
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q');
if (query) {
    inputElement.value = query;
    // Waiting for the pages to load... Not the greatest.
    setTimeout(() => {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.contentWindow.postMessage({ type: 'input', message: query }, '*');
            iframe.contentWindow.postMessage({ type: 'submit' }, '*');
        });
        inputElement.value = '';
    }, 4000);
}

// Load the checkbox state.
storage.local.get(['iframes'], (result) => {
    const savedIframes = result.iframes || [];

    checkboxes.forEach(checkbox => {
        // Check if this domain should be loaded
        checkbox.checked = savedIframes.includes(checkbox.value);

        // Add/remove iframe based on checkbox state
        if (checkbox.checked) {
            addIframe(checkbox.value);
        }

        // Add change listener
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                addIframe(this.value);
            } else {
                removeIframe(this.value);
            }
            saveIframeState();
        });
    });
});

function addIframe(domain) {
    if (!document.getElementById(`iframe-${domain}`)) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://${domain}`;
        iframe.id = `iframe-${domain}`;
        iframeContainer.appendChild(iframe);
    }
}

function removeIframe(domain) {
    const iframe = document.getElementById(`iframe-${domain}`);
    if (iframe) {
        iframe.remove();
    }
}

function saveIframeState() {
    const currentIframes = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    storage.local.set({ iframes: currentIframes });
}

let keepFocus = false;
let focusTimeout;
// lovable seems to steal focus everytime you type, so we have to steal it back
inputElement.addEventListener('blur', function() {
    if (!keepFocus) {
        return;
    }
    // We have to wait for the child iframe to steal focus before we can steal
    // it back.
    setTimeout(() => { inputElement.focus(); }, 1);
});

inputElement.addEventListener('input', function(event) {
    keepFocus = true;
    const message = event.target.value;
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        iframe.contentWindow.postMessage({ type: 'input', message }, '*');
    });

    clearTimeout(focusTimeout);
    focusTimeout = setTimeout(() => {
        keepFocus = false;
    }, 400)
});

// Handle enter key in input.
inputElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.contentWindow.postMessage({ type: 'submit' }, '*');
        });
        inputElement.value = '';
    }
});
