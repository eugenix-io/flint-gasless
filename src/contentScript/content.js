import browser from 'webextension-polyfill';

/**
 * Content script has context of popup 
 * Content script runs before all
 * Content can communicate with injected and vice-versa
 * Content can also communicate with background script so it's
 * like a middle man for injected and background script
 */

var s = document.createElement('script');
// We can access injected here because we have mentioned in manifest under
// web_accessible_resources
s.src = browser.runtime.getURL('injected.js');

// Injecting inject.js via document
// This will inject the inject.js in the current page context

(document.head || document.documentElement).appendChild(s);
s.onload = () => {
    s.remove();
};

// Unused code

// window.addEventListener(
//     'message',
//     function (event) {
//         if (
//             event.data.identifier &&
//             event.data.identifier === 'FLINT_GASPAY_EXTENSION_EVENT'
//         ) {
//             browser.runtime.sendMessage(event.data);
//         }
//     },
//     false
// );

// The following code listens for events from background script
// and dispatches a global event on window variable
// We can listen for this event anywhere in documnet context

browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == 'set_gaspay_version') {
        console.log(msg.version, 'Manifest version');
        window.dispatchEvent(
            new CustomEvent('set_gaspay_version', {
                detail: {
                    version: msg.version,
                },
            })
        );
    }
});
