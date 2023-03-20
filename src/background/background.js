import browser from 'webextension-polyfill';

chrome.runtime.onMessage.addListener((res) => {
    if (res.action === 'GASPAY_SET_ADDRESS') {
        browser.storage.local.set({ wallet: res.metadata });
    }
    if (res.action === 'GASPAY_VIEW_TRANSACTION') {
        const hash = res.metadata;
        browser.windows
            .create({
                url: 'index.html',
                type: 'panel',
                width: 450,
                height: 600,
            })
            .then((createdWindow) => {
                // log.info(createdWindow?.id, 'Assigning popup to id');
                // currentPopup = createdWindow?.id;
            });
        setTimeout(() => {
            browser.runtime.sendMessage({
                identifier: 'GAS_PAY_INTERNAL',
                action: 'TRANSACTION',
                metadata: hash,
            });
        }, 5000);
    }
});
