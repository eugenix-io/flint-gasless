import browser from 'webextension-polyfill';
import React, { useEffect, useState } from 'react';
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


