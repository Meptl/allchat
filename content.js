console.log("Loaded")

// console.log(browser.runtime.getManifest());

const domainInfo = {
    'chatgpt.com': {
        textArea: '.ProseMirror > p',
        sendButton: 'button[aria-label="Send prompt"]',
        setMessage: (element, message) => { element.innerHTML = message; }
    },
    'claude.ai': {
        textArea: '.ProseMirror > p',
        sendButton: 'button[aria-label="Send Message"]',
        setMessage: (element, message) => { element.innerHTML = message; }
    },
    'www.perplexity.ai': {
        textArea: 'textarea.overflow-auto',
        sendButton: 'button[aria-label="Submit"]',
        setMessage: (element, message) => { element.value = message; }
    },
    'chat.deepseek.com': {
        textArea: 'textarea#chat-input',
        sendButton: 'div._7436101',
        setMessage: (element, message) => { element.value = message; }
    },
    'gemini.google.com': {
        textArea: 'div.ql-editor > p',
        sendButton: 'button[aria-label="Send message"]',
        setMessage: (element, message) => { element.innerHTML = message; }
    },
    'v0.dev': {
        textArea: 'textarea#chat-main-textarea',
        sendButton: 'button[data-testid="prompt-form-send-button"]',
        setMessage: (element, message) => { element.value = message; }
    },
    'lovable.dev': {
        textArea: 'textarea#chatinput',
        sendButton: 'button#chatinput-send-message-button',
        setMessage: (element, message) => { element.value = message; }
    }
};

// window.postMessage({type:'input',message:'sup'},'*')
// window.postMessage({type:'submit'},'*')

window.addEventListener('message', function(event) {
    if (event.data.type === 'input') {
        const hostname = window.location.hostname;
        const domain = Object.keys(domainInfo).find(domain => hostname.includes(domain));
        if (domain) {
            const chatTextAreaElem = document.querySelector(domainInfo[domain].textArea);
            domainInfo[domain].setMessage(chatTextAreaElem, event.data.message);
            // Inform any listeners that the text field was updated (allows
            // clicking submit).
            chatTextAreaElem.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    if (event.data.type === 'submit') {
        const hostname = window.location.hostname;
        const domain = Object.keys(domainInfo).find(domain => hostname.includes(domain));
        const chatSendButtonElem = document.querySelector(domainInfo[domain].sendButton);
        chatSendButtonElem.click();
    }
});
