import browser from 'webextension-polyfill';

var s = document.createElement('script');
s.src = browser.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(s);
s.onload = () => {
    s.remove();
};

window.addEventListener(
    'message',
    function (event) {
        if (event.data.type && event.data.type == 'GASPAY_SET_ADDRESS') {
            browser.runtime.sendMessage(event.data);
        }
    },
    false
);
