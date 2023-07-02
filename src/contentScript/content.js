import browser from 'webextension-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import MyComponent from './../components/Widget.jsx';

var s = document.createElement('script');
s.src = browser.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(s);
s.onload = () => {
    s.remove();
};

window.addEventListener(
    'message',
    function (event) {
        if (
            event.data.identifier &&
            event.data.identifier === 'FLINT_GASPAY_EXTENSION_EVENT'
        ) {
            browser.runtime.sendMessage(event.data);
        }
    },
    false
);

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

function injectWidget() {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'myExtensionWidget';
    document.body.appendChild(widgetContainer);

    ReactDOM.render(<MyComponent />, widgetContainer);
}

// Inject the widget when the DOM is ready
document.addEventListener('DOMContentLoaded', injectWidget);
// injectWidget();
