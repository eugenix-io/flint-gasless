import browser from 'webextension-polyfill';

var s = document.createElement('script');
s.src = browser.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(s);
s.onload = () => {
    s.remove();
};
