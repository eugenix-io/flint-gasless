import browser from 'webextension-polyfill';

const createOrUpdateWindow = async () => {
    function findTab(tab) {
        return tab.url == 'index.html';
    }

    // first get all open chrome windows
    let windows = await browser.windows.getAll({
        populate: true,
        windowTypes: ['popup'],
    });

    // find a window that has a tab with the url "popup.html"
    let myWindow = windows.find((window) =>
        window.tabs.some((tab) => findTab(tab))
    );

    // find a tab that has the url "popup.html"
    let myTab = myWindow?.tabs.find((tab) => findTab(tab));

    if (myWindow && myTab) {
        // if such tab exists, focus the parent window and the tab
        await browser.windows.update(myWindow.id, { focused: true });
        await browser.tabs.update(myTab.id, { active: true });
    } else {
        // open the window and the tab
        await browser.windows.create({
            url: 'index.html',
            type: 'popup',
            width: 450,
            height: 650,
        });
    }
};

chrome.runtime.onMessage.addListener((res) => {
    if (res.action === 'GASPAY_SET_ADDRESS') {
        browser.storage.local.set({ wallet: res.metadata });
    }
    if (res.action === 'GASPAY_VIEW_TRANSACTION') {
        const hash = res.metadata;
        browser.storage.local.set({ newPendingTransaction: hash }).then((_) => {
            createOrUpdateWindow();
        });
    }
});

const version = browser.runtime.getManifest().version;
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status != 'complete') return;
    (async () => {
        const response = await browser.tabs.sendMessage(tabId, {
            action: 'set_gaspay_version',
            version,
        });
        console.log(response);
    })();
});
