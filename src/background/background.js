import browser from 'webextension-polyfill';

chrome.runtime.onMessage.addListener((res) => {
    browser.storage.local.set(res);
});
