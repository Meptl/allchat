// Firefox compatibility - use browser API if available
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.browserAction.onClicked.addListener(() => {
  browserAPI.runtime.openOptionsPage();
});

// Set default suggestion for omnibox
if (browserAPI.omnibox && browserAPI.omnibox.setDefaultSuggestion) {
  browserAPI.omnibox.setDefaultSuggestion({
    description: 'Search across all AI chatbots - type your query and press Enter'
  });
}

// Handle omnibox input suggestions (required for Firefox compatibility)
if (browserAPI.omnibox && browserAPI.omnibox.onInputChanged) {
  browserAPI.omnibox.onInputChanged.addListener((text, suggest) => {
    // Provide a simple suggestion to show the omnibox is working
    if (text.trim()) {
      suggest([
        {
          content: text,
          description: `Search "${text}" across all AI chatbots`
        }
      ]);
    }
  });
}

// Handle omnibox input (triggered when user types "@ac <query>" and presses Enter)
if (browserAPI.omnibox && browserAPI.omnibox.onInputEntered) {
  browserAPI.omnibox.onInputEntered.addListener((text) => {
    // Open options page with query parameter
    const optionsUrl = browserAPI.runtime.getURL('options.html') + '?q=' + encodeURIComponent(text);
    browserAPI.tabs.create({ url: optionsUrl });
  });
}
