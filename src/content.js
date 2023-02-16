import browser from 'webextension-polyfill';
var s = document.createElement('script');
// This should intentionally fail on chrome as we inject the script in the background file.
s.src = browser.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(s);
s.onload = () => {
  s.remove();
};

console.log('content script loaded');